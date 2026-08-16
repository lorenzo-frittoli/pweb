{
  description = "PWEB Course Development Environment (PHP 8.0, MariaDB, Dev Tools)";

  inputs = {
    # Pinned to nixos-21.11 / 22.05 era for native PHP 8.0.x and MariaDB 10.x compatibility
    nixpkgs.url = "github:nixos/nixpkgs/nixos-21.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        # PHP 8.0 with required database extensions (mysqli, pdo_mysql, session, json)
        phpEnv = pkgs.php80.buildEnv {
          extensions = { all, enabled }: with all; [
            mysqli
            pdo_mysql
            session
            json
            curl
            mbstring
            openssl
          ];
          extraConfig = ''
            display_errors = On
            display_startup_errors = On
            error_reporting = E_ALL
            mysqli.default_socket = ./data/mysql/mysql.sock
            pdo_mysql.default_socket = ./data/mysql/mysql.sock
          '';
        };

        mariadb = pkgs.mariadb;

        # Helper scripts
        startDb = pkgs.writeShellScriptBin "start-db" ''
          set -e
          DEV_DIR="$(pwd)/data/mysql"
          SOCKET="$DEV_DIR/mysql.sock"
          PID_FILE="$DEV_DIR/mysqld.pid"

          mkdir -p "$DEV_DIR"

          if [ ! -d "$DEV_DIR/mysql" ]; then
            echo "-> Initializing local MariaDB database..."
            mysql_install_db --datadir="$DEV_DIR" --basedir="${mariadb}" --auth-root-authentication-method=normal > /dev/null
          fi

          if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "-> MariaDB is already running."
          else
            echo "-> Starting MariaDB on socket $SOCKET..."
            mysqld --datadir="$DEV_DIR" --socket="$SOCKET" --pid-file="$PID_FILE" --port=3306 --bind-address=127.0.0.1 > "$DEV_DIR/mysql.log" 2>&1 &
            
            # Wait until socket is created
            while [ ! -S "$SOCKET" ]; do
              sleep 0.5
            done
            echo "-> MariaDB started successfully!"
          fi
        '';

        stopDb = pkgs.writeShellScriptBin "stop-db" ''
          DEV_DIR="$(pwd)/data/mysql"
          PID_FILE="$DEV_DIR/mysqld.pid"
          if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "-> Stopping MariaDB..."
            kill $(cat "$PID_FILE")
            rm -f "$DEV_DIR/mysql.sock"
            echo "-> Stopped."
          else
            echo "-> MariaDB is not running."
          fi
        '';

        # Emulates the course's EsportaDB.bat requirement
        esportaDb = pkgs.writeShellScriptBin "esporta-db" ''
          DEV_DIR="$(pwd)/data/mysql"
          SOCKET="$DEV_DIR/mysql.sock"

          if [ ! -S "$SOCKET" ]; then
            echo "Error: MariaDB is not running. Run 'start-db' first."
            exit 1
          fi

          read -p "Enter Database Name (e.g., cognome_matricola): " DBNAME
          if [ -z "$DBNAME" ]; then
            echo "Error: Database name cannot be empty."
            exit 1
          fi

          mysqldump --socket="$SOCKET" -u root "$DBNAME" > "$DBNAME.sql"
          echo "-> Database dumped successfully to $DBNAME.sql"
        '';

        startServer = pkgs.writeShellScriptBin "start-server" ''
          echo "-> Starting PHP Development Server at http://localhost:8000"
          php -S localhost:8000
        '';

      in {
        devShells.default = pkgs.mkShell {
          name = "pweb-dev-shell";

          buildInputs = [
            phpEnv
            mariadb
            startDb
            stopDb
            esportaDb
            startServer
          ];

          shellHook = ''
            echo "======================================================="
            echo "  PWEB Nix Development Shell (PHP 8.0 & MariaDB)       "
            echo "======================================================="
            echo " Available commands:"
            echo "   start-db     -> Initializes & starts local MariaDB server"
            echo "   stop-db      -> Stops MariaDB server"
            echo "   start-server -> Starts PHP local web server (port 8000)"
            echo "   esporta-db   -> Dumps DB into <dbname>.sql (like EsportaDB.bat)"
            echo "   mysql        -> Direct CLI access: mysql -S ./data/mysql/mysql.sock -u root"
            echo "======================================================="

            # Alias for easy CLI access to local MariaDB socket
            alias mysql='mysql -S "$(pwd)/data/mysql/mysql.sock" -u root'
            alias mysqldump='mysqldump -S "$(pwd)/data/mysql/mysql.sock" -u root'
          '';
        };
      }
    );
}

{
  description = "PWEB Course Development Environment (PHP 8.0, MariaDB)";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-21.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        # PHP 8.0 with required database extensions
        phpEnv = pkgs.php80.buildEnv {
          extensions = { all, enabled }: with all;
            [
              mysqli
              pdo_mysql
              session
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

        # --- Backend Scripts ---

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
            
            while [ ! -S "$SOCKET" ]; do sleep 0.5; done
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

        esportaDb = pkgs.writeShellScriptBin "esporta-db" ''
          DEV_DIR="$(pwd)/data/mysql"
          SOCKET="$DEV_DIR/mysql.sock"

          if [ ! -S "$SOCKET" ]; then
            echo "Error: MariaDB is not running. Run 'start-db' first."
            exit 1
          fi

          read -p "Enter Database Name (e.g., cognome_matricola): " DBNAME
          if [ -z "$DBNAME" ]; then echo "Error: Database name cannot be empty."; exit 1; fi

          ${mariadb}/bin/mysqldump --socket="$SOCKET" -u root "$DBNAME" > "$DBNAME.sql"
          echo "-> Database dumped successfully to $DBNAME.sql"
        '';

        startServer = pkgs.writeShellScriptBin "start-server" ''
          echo "-> Starting PHP Development Server at http://localhost:8000"
          php -S localhost:8000
        '';

        # --- DB CLI Wrappers ---

        mysqlWrapper = pkgs.writeShellScriptBin "mysql" ''
          exec ${mariadb}/bin/mysql -S "$(pwd)/data/mysql/mysql.sock" -u root "$@"
        '';

        mysqldumpWrapper = pkgs.writeShellScriptBin "mysqldump" ''
          exec ${mariadb}/bin/mysqldump -S "$(pwd)/data/mysql/mysql.sock" -u root "$@"
        '';

      in
      {
        devShells.default = pkgs.mkShell {
          name = "pweb-dev-shell";

          buildInputs = [
            phpEnv
            mariadb
            startDb
            stopDb
            esportaDb
            startServer
            mysqlWrapper
            mysqldumpWrapper
          ];

          shellHook = ''
            echo "======================================================="
            echo "  PWEB Nix Development Shell (PHP & MariaDB)           "
            echo "======================================================="
            echo " Backend Commands:"
            echo "   start-db     -> Starts local MariaDB server"
            echo "   stop-db      -> Stops MariaDB server"
            echo "   start-server -> Starts PHP server (port 8000)"
            echo "   esporta-db   -> Dumps DB into <dbname>.sql"
            echo "   mysql        -> Direct DB CLI access"
            echo "======================================================="
          '';
        };
      }
    );
}

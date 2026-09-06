class UI {
	constructor() {
		const byId = (id) => document.getElementById(id);
		this.authContainer = byId("auth-container");
		this.loggedInContainer = byId("logged-in-container");
		this.authForm = byId("auth-form");
		this.btnSignup = byId("btn-signup");
		this.btnLogout = byId("btn-logout");
		this.btnStart = byId("btn-start");
		this.welcomeMsg = byId("welcome-message");
		this.stats = {
			high_score: byId("stat-best-score"),
			avg_score: byId("stat-avg-score"),
			games_played: byId("stat-games-played")
		};
		this.leaderboard = document.querySelector(".score-list");
	}

	showLogout(username = "") {
		this.authContainer.style.display = "none";
		this.loggedInContainer.style.display = "block";
		this.welcomeMsg.textContent = username ? `Welcome, ${username}!` : "";
	}

	showLogin() {
		this.loggedInContainer.style.display = "none";
		this.authContainer.style.display = "block";
		this.authForm.reset();
		this.renderStats();
	}

	renderStats(stats = null) {
		for (const [key, el] of Object.entries(this.stats)) {
			if (el) el.textContent = stats ? Math.round(stats[key]) : "--";
		}
	}

	renderLeaderboard(entries = []) {
		if (!entries.length) {
			this.leaderboard.innerHTML = "<li>No scores recorded yet.</li>";
			return;
		}
		this.leaderboard.innerHTML = entries.map((entry, i) => `
            <li>
                <span class="player-info"><span class="rank">${i + 1}.</span> ${entry.username}</span>
                <span class="score-number">${entry.high_score}</span>
            </li>
        `).join("");
	}
}

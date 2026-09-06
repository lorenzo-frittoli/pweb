class App {
	constructor() {
		this.api = new APIHandler();
		this.ui = new UI();
		this.simulation = new Simulation();
		this.isLoggedIn = false;
		this._initEvents();
		this.refreshAll();
	}

	async refreshAll() {
		await Promise.all([this.refreshStats(), this.refreshLeaderboard()]);
	}

	async refreshLeaderboard() {
		const res = await this.api.getLeaderboard();
		if (res?.success) {
			this.ui.renderLeaderboard(res.leaderboard);
		}
	}

	async refreshStats() {
		const res = await this.api.getPlayerStats();
		if (res?.success && res.logged_in) {
			this.isLoggedIn = true;
			this.ui.showLogout(res.username);
			this.ui.renderStats(res.stats);
		} else {
			this.isLoggedIn = false;
			this.ui.showLogin();
			this.ui.renderStats();
		}
	}

	_getCredentials() {
		const form = this.ui.authForm;
		if (!form.reportValidity()) return null;
		return {
			user: form.username.value.trim(),
			pass: form.password.value
		};
	}

	async _login() {
		const creds = this._getCredentials();
		if (!creds) return;
		const res = await this.api.login(creds.user, creds.pass);
		if (!res.success) return alert("Login error");
		await this.refreshAll();
	}

	async _signup() {
		const creds = this._getCredentials();
		if (!creds) return;
		const res = await this.api.signup(creds.user, creds.pass);
		if (!res.success) return alert("Signup error: username taken or invalid");
		await this.refreshAll();
	}

	_initEvents() {
		this.ui.btnStart?.addEventListener("click", () => {
			this.simulation.startGameOrFail();
		});

		this.simulation.addEventListener("gameover", async (e) => {
			if (!this.isLoggedIn) return;
			const res = await this.api.submitScore(e.detail.score);
			if (res?.success) this.refreshAll();
		});

		this.ui.authForm.addEventListener("submit", (e) => {
			e.preventDefault();
			this._login();
		});

		this.ui.btnSignup.addEventListener("click", () => {
			this._signup();
		});

		this.ui.btnLogout.addEventListener("click", async () => {
			await this.api.logout();
			await this.refreshAll();
		});
	}
}

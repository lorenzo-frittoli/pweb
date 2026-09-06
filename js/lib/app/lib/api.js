// All API calls return promises
// They all have a "success" flag along with possible other data
// In case of server/network errors returns { success: false }
class APIHandler {
	_getCsrfToken() {
		return document.cookie
			.split("; ")
			.find((row) => row.startsWith("csrf_token="))
			?.split("=")[1];
	}

	async _post(url, data = {}) {
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": this._getCsrfToken() || ""
				},
				body: JSON.stringify(data)
			});
			return res.ok ? await res.json() : { success: false };
		} catch {
			return { success: false };
		}
	}

	async _get(url) {
		try {
			const res = await fetch(url);
			return res.ok ? await res.json() : { success: false };
		} catch {
			return { success: false };
		}
	}

	login(username, password) { return this._post("php/login.php", { username, password }); }
	signup(username, password) { return this._post("php/signup.php", { username, password }); }
	logout() { return this._post("php/logout.php"); }
	getPlayerStats() { return this._get("php/stats.php"); }
	getLeaderboard() { return this._get("php/leaderboard.php"); }
	submitScore(score) { return this._post("php/save_score.php", { score }); }
}

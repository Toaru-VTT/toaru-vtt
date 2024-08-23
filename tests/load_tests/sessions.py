from locust import HttpUser, between, task
from random import choice

sessions = []

class SessionUser(HttpUser):
    wait_time = between(5, 15)
    _game_state: dict[str, int]
    _session: str
    _base_session: str

    def on_start(self):
        self.start_session()
    
    @task
    def start_session(self):
        global sessions
        data = self.client.post("/session").json()
        self._session = data["session"]
        self._game_state = data["state"]
        sessions.append(self._session)
        if len(sessions) > 1000:
            sessions = sessions[:100]

    @task
    def load_session(self):
        self._session = choice(sessions)
        data = self.client.get(f"/session/{self._session}").json()
        self._game_state = data["state"]

    @task
    def increment(self):
        self._game_state["count"] += 1
        self.client.post(f"/session/{self._session}", json=self._game_state)

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app.agent.runtime import AutonomousEnterpriseAgent
from backend.app.agent.tools import serialize
from backend.app.sandbox.store import EnterpriseStore


GOALS = [
    "Process the latest invoice from Acme Corp. If the invoice amount requires approval according to company policy, ask me for approval before processing it. Once approved, process the invoice and independently verify that the correct invoice was processed successfully. Give me a concise summary and evidence.",
    "Find the latest refund request from customer Acme Corp, check the refund policy, and process it if permitted.",
    "Find Acme Corp's latest contract and update the vendor record with the renewal date.",
    "Find the latest onboarding request for an employee and create/update the employee record according to company policy.",
    "Find the latest support ticket from Acme, inspect the attached information, update the CRM, and notify the account manager.",
]


def main() -> None:
    sandbox = EnterpriseStore()
    agent = AutonomousEnterpriseAgent(sandbox)
    for goal in GOALS:
        result = agent.run(goal)
        print("=" * 88)
        print(goal)
        print(json.dumps(serialize(result), indent=2))


if __name__ == "__main__":
    main()

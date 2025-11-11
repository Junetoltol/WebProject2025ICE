from typing import Any, Dict, List, Protocol


class Provider(Protocol):
    def generate(
        self,
        messages: List[Dict[str, str]],
        schema: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        ...

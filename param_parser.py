
class ParamParser:
    def __init__(self, params: "dict(str,str)", param_types: "dict(str, type)", *, default=None, default_type=str):
        self.dict = {}
        self.default = default
        for name, value_str in params.items():
            try:
                val = param_types.get(name, default_type)(value_str)
                self.dict[name] = val
            except ValueError as e:
                print(f"Error occured while parsing parameter '{name}' into a string.\n\t{e}")
                continue
        return
    
    # returns a dict of the params in the parser, and in the argument (if params is supplied)
    def dict_of(self, params: list or None = None):
        if params:
            return{ p:self.dict[p] for p in params if p in self.dict}
        return self.dict.copy()

    def __getattr__(self, key: str):
        return self.dict.get(key, self.default)

    def __getitem__(self, key: str):
        return self.dict.get(key, self.default)

    def __repr__(self) -> str:
        return f"params: {self.dict.__repr__()} default= {self.default}"


class BoolParam:
    def __init__(self, bool_str) -> bool:
        bool_str_transformed = bool_str.strip().lower()
        if bool_str_transformed not in ["true", "false", "t", "f"]:
            raise ValueError(f'invalid string for {self.__class__}: {bool_str}')
        return bool_str_transformed == "true" or bool_str_transformed == "t"
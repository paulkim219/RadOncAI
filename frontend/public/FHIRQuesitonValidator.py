import json

with open('./FHIRQuestionnaire.json', 'r') as file:
    fhir_questionnaire = json.load(file)

all_unique_keys = set()
for element in fhir_questionnaire['snapshot']['element']:
    for key in element.keys():
        all_unique_keys.add(key)


class FHIRQuestionnaireElement:
    def __init__(self, id, path, short, definition, comment, alias, requirements, min, max, base, type, constraint, mustSupport, isModifier, isModifierReason, isSummary, binding, mapping, extension, condition, meaningWhenMissing, contentReference, representation):
        self.id = id
        self.path = path
        self.short = short
        self.definition = definition
        self.comment = comment
        self.alias = alias
        self.requirements = requirements
        self.min = min
        self.max = max
        self.base = base
        self.type = type
        self.constraint = constraint
        self.mustSupport = mustSupport
        self.isModifier = isModifier
        self.isModifierReason = isModifierReason
        self.isSummary = isSummary
        self.binding = binding
        self.mapping = mapping
        self.extension = extension
        self.condition = condition
        self.meaningWhenMissing = meaningWhenMissing
        self.contentReference = contentReference
        self.representation = representation

    def validate(self):
        for key in all_unique_keys:
            if key not in self.element.keys():
                print(f"Key {key} not found in element {self.element['id']}")
                return False
        return True


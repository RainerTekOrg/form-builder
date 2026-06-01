import { createBuilder } from "@coltorapps/builder";
import * as entities from "./entities";

export const formBuilder = createBuilder({
  entities: [
    entities.textFieldEntity,
    entities.textareaFieldEntity,
    entities.numberFieldEntity,
    entities.integerFieldEntity,
    entities.selectFieldEntity,
    entities.multiSelectFieldEntity,
    entities.booleanFieldEntity,
    entities.dateFieldEntity,
    entities.datetimeFieldEntity,
    entities.fileFieldEntity,
    entities.signatureFieldEntity,
    entities.sectionEntity,
    entities.repeatingEntity,
    entities.computedFieldEntity,
  ],
});

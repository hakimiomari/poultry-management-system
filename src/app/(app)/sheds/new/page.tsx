import { ActionForm } from "@/components/Form";
import { createShedAction } from "@/lib/actions";
import { Field, inputCls, PageHeader } from "@/components/ui";
import { SHED_STATUSES, SHED_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";

export default function NewShed() {
  return (
    <div className="max-w-lg">
      <PageHeader title="New shed" />
      <ActionForm action={createShedAction}>
        <Field label="Shed name"><input name="shedName" required className={inputCls} placeholder="Shed-4-East" /></Field>
        <Field label="Capacity (birds)"><input name="capacity" type="number" inputMode="numeric" min={1} required className={inputCls} /></Field>
        <Field label="Type"><select name="shedType" className={inputCls}>{SHED_TYPES.map((v) => <option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field>
        <Field label="Status"><select name="status" className={inputCls}>{SHED_STATUSES.map((v) => <option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="hasSensors" /> Has environment sensors</label>
      </ActionForm>
    </div>
  );
}

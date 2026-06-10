import Card from "../common/Card";
import Button from "../common/Button";

export default function EntityFormShell({ title, description, onSubmit, children, submitLabel = "Save changes" }) {
  return (
    <Card title={title} subtitle={description}>
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
}

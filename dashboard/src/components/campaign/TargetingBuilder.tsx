import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, X, Target } from "lucide-react";
import type { Rule } from "@/store/useStore";

interface TargetingBuilderProps {
  triggerEvent: string;
  setTriggerEvent: (value: string) => void;
  rules: Rule[];
  setRules: (rules: Rule[]) => void;
}

export const TargetingBuilder = ({ triggerEvent, setTriggerEvent, rules, setRules }: TargetingBuilderProps) => {

  const addRule = () => {
    setRules([
      ...rules,
      { id: Date.now(), type: "attribute", field: "", operator: "==", value: "" },
    ]);
  };

  const removeRule = (id: number) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: number, field: keyof Rule, value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="mr-2 h-5 w-5 text-primary" />
          Targeting Rules
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Define when and to whom this nudge should be shown
        </p>
      </div>

      {/* Trigger Event */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <Label htmlFor="triggerEvent" className="text-sm font-semibold">
          Trigger Event *
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          The SDK event that triggers this nudge
        </p>
        <Select value={triggerEvent} onValueChange={setTriggerEvent}>
          <SelectTrigger id="triggerEvent">
            <SelectValue placeholder="Select trigger event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="app_opened">app_opened - App launch</SelectItem>
            <SelectItem value="screen_viewed">screen_viewed - Screen navigation</SelectItem>
            <SelectItem value="session_start">session_start - Session begins</SelectItem>
            <SelectItem value="button_clicked">button_clicked - Button interaction</SelectItem>
            <SelectItem value="product_viewed">product_viewed - Product page view</SelectItem>
            <SelectItem value="product_added">product_added - Add to cart</SelectItem>
            <SelectItem value="cart_viewed">cart_viewed - Cart page view</SelectItem>
            <SelectItem value="checkout_started">checkout_started - Checkout begins</SelectItem>
            <SelectItem value="payment_info_entered">payment_info_entered - Payment details</SelectItem>
            <SelectItem value="order_completed">order_completed - Purchase complete</SelectItem>
            <SelectItem value="search_performed">search_performed - Search query</SelectItem>
            <SelectItem value="form_submitted">form_submitted - Form completion</SelectItem>
            <SelectItem value="link_clicked">link_clicked - Link interaction</SelectItem>
            <SelectItem value="video_played">video_played - Video started</SelectItem>
            <SelectItem value="share_clicked">share_clicked - Share action</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Conditional Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Additional Conditions</Label>
          <Button variant="outline" size="sm" onClick={addRule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>

        {rules.map((rule, index) => (
          <Card key={rule.id} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {index > 0 && (
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">AND</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRule(rule.id)}
                className="ml-auto h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={rule.type}
                  onValueChange={(v: "event" | "attribute") => updateRule(rule.id, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attribute">User Attribute</SelectItem>
                    <SelectItem value="event">Event Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Field</Label>
                <Input
                  value={rule.field}
                  onChange={(e) => updateRule(rule.id, "field", e.target.value)}
                  placeholder="e.g., cart_total"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Operator</Label>
                <Select
                  value={rule.operator}
                  onValueChange={(v) => updateRule(rule.id, "operator", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="==">equals (==)</SelectItem>
                    <SelectItem value="!=">not equals (!=)</SelectItem>
                    <SelectItem value=">">greater than (&gt;)</SelectItem>
                    <SelectItem value=">=">greater or equal (&gt;=)</SelectItem>
                    <SelectItem value="<">less than (&lt;)</SelectItem>
                    <SelectItem value="<=">less or equal (&lt;=)</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Value</Label>
                <Input
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                  placeholder="e.g., 150"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-accent/5 border-accent/20">
        <Label className="text-sm font-semibold mb-2 block">Targeting Summary</Label>
        <div className="font-mono text-sm space-y-1">
          <div>
            <span className="text-muted-foreground">WHEN:</span> Event{" "}
            <span className="text-primary font-semibold">{triggerEvent}</span> occurs
          </div>
          {rules.length > 0 && (
            <div>
              <span className="text-muted-foreground">AND:</span>
              <ul className="ml-6 mt-1 space-y-1">
                {rules.map((rule) => (
                  <li key={rule.id} className="text-xs">
                    {rule.type === "attribute" ? "User" : "Event"}.
                    <span className="text-accent font-semibold">{rule.field || "???"}</span>{" "}
                    {rule.operator} {rule.value || "???"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

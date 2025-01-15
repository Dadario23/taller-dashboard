"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function UIPreviewPage() {
  const [name, setName] = useState("");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">UI Components Preview</h1>

      {/* Botón */}
      <section>
        <h2 className="text-xl font-semibold">Button</h2>
        <Button variant="default" size="default">
          Default Button
        </Button>
        <Button variant="outline" size="sm">
          Outline Small Button
        </Button>
      </section>

      {/* Tarjeta */}
      <section>
        <h2 className="text-xl font-semibold">Card</h2>
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            This is a test card to verify the Card component.
          </CardContent>
        </Card>
      </section>
      <Button
        onClick={() =>
          toast({
            title: "Hello!",
            description: "This is a test toast.",
          })
        }
      >
        Show Toast
      </Button>

      {/* Input */}
      <section>
        <h2 className="text-xl font-semibold">Input</h2>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="mt-2">Hello, {name || "stranger"}!</p>
      </section>

      {/* Toast (si tienes uno configurado) */}
      <section>
        <h2 className="text-xl font-semibold">Toast</h2>
        {/* <Toast title="Test Toast" description="This is a test toast." /> */}
      </section>
    </div>
  );
}

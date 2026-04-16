"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitContactForm } from "@/actions/contact";

const subjects = [
  { value: "general", label: "General Inquiry" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "privacy", label: "Privacy" },
];

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [subject, setSubject] = useState("");

  function handleSubmit(formData: FormData) {
    formData.set("subject", subject);
    setResult(null);
    startTransition(async () => {
      const res = await submitContactForm(formData);
      setResult(res);
    });
  }

  if (result?.success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Message Sent</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for reaching out. We&apos;ll review your message and get back to you as soon
          as possible.
        </p>
        <Button onClick={() => setResult(null)} variant="outline">
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground mt-2">
          Have a question, found a bug, or want to request a feature? We&apos;d love to hear from you.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
          <CardDescription>Fill out the form below and we&apos;ll get back to you.</CardDescription>
        </CardHeader>
        <CardContent>
          {result?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject} required>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a topic..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us what's on your mind..."
                rows={5}
                required
                disabled={isPending}
              />
            </div>

            <Button type="submit" disabled={isPending || !subject} className="w-full gap-2">
              {isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

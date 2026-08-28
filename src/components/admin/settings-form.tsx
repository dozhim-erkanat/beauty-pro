"use client";

import { useActionState } from "react";
import { saveSettings, type ActionState } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { FormMessage, Labeled, SubmitButton } from "@/components/admin/ui";

const FIELDS: { key: string; label: string; hint?: string; textarea?: boolean }[] =
  [
    { key: "phone", label: "Телефон", hint: "Показывается в шапке сайта" },
    {
      key: "whatsapp",
      label: "WhatsApp",
      hint: "Только цифры с кодом страны, например 77001234567",
    },
    { key: "email", label: "Email" },
    { key: "address", label: "Адрес" },
    { key: "instagram", label: "Ссылка на Instagram" },
    {
      key: "about",
      label: "Короткое описание компании",
      hint: "Подвал сайта и страница «Контакты»",
      textarea: true,
    },
  ];

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveSettings,
    null,
  );

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      <Labeled
        label="Логотип сайта"
        hint="Показывается в шапке вместо названия. Лучше PNG с прозрачным фоном."
      >
        <ImageUploader
          name="logo_url"
          folder="site"
          defaultValue={settings.logo_url ? [settings.logo_url] : []}
        />
      </Labeled>

      {FIELDS.map((field) => (
        <Labeled key={field.key} label={field.label} hint={field.hint}>
          {field.textarea ? (
            <textarea
              name={field.key}
              rows={3}
              defaultValue={settings[field.key] ?? ""}
              className="field resize-y"
            />
          ) : (
            <input
              name={field.key}
              defaultValue={settings[field.key] ?? ""}
              className="field"
            />
          )}
        </Labeled>
      ))}

      <FormMessage state={state} />
      <SubmitButton />
    </form>
  );
}

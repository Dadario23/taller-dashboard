"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Validación personalizada para FileList
const fileSchema = z.custom<FileList>(
  (value) => typeof FileList !== "undefined" && value instanceof FileList,
  { message: "Please upload a file." }
);

const formSchema = z.object({
  file: fileSchema
    .refine((files) => files && files.length > 0, {
      message: "Please upload at least one file.",
    })
    .refine((files) => ["text/csv"].includes(files[0]?.type), {
      message: "Please upload a CSV file.",
    }),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepairsImportDialog({ open, onOpenChange }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const file = data.file[0];
    if (file) {
      const fileDetails = {
        name: file.name,
        size: file.size,
        type: file.type,
      };

      toast({
        title: "You have imported the following file:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(fileDetails, null, 2)}
            </code>
          </pre>
        ),
      });

      onOpenChange(false); // Cerrar el diálogo después de importar
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      form.setValue("file", files); // Actualiza el valor del formulario
      form.trigger("file"); // Dispara la validación
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        form.reset(); // Reinicia el formulario cuando se cierra
      }}
    >
      <DialogContent className="sm:max-w-sm gap-2">
        <DialogHeader className="text-left">
          <DialogTitle>Import Repairs</DialogTitle>
          <DialogDescription>
            Import repairs quickly from a CSV file.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="repair-import-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="file"
              render={({ fieldState }) => (
                <FormItem className="space-y-1 mb-2">
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".csv"
                      className="h-8"
                      onChange={handleFileChange} // Maneja el cambio del archivo
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button type="submit" form="repair-import-form">
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

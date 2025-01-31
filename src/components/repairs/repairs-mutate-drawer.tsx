"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SelectDropdown } from "@/components/select-dropdown";
import { Repair } from "@/components/repairs/data/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Repair;
}

// Esquema de validación para el formulario
const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  status: z.enum([
    "Pending",
    "In Progress",
    "Completed",
    "Canceled",
    "On Hold",
  ]),
  label: z.enum(["Documentation", "Feature", "Bug"]),
  priority: z.enum(["High", "Medium", "Low"]),
});

type RepairsForm = z.infer<typeof formSchema>;

export function RepairsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow;

  const validStatuses = [
    "Pending",
    "In Progress",
    "Completed",
    "Canceled",
    "On Hold",
  ];

  const form = useForm<RepairsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentRow?.title || "",
      status: validStatuses.includes(currentRow?.status || "")
        ? (currentRow?.status as RepairsForm["status"])
        : "Pending", // Valor por defecto
      label: ["Documentation", "Feature", "Bug"].includes(
        currentRow?.label || ""
      )
        ? (currentRow?.label as "Documentation" | "Feature" | "Bug")
        : "Documentation", // Valor por defecto
      priority: currentRow?.priority || "Medium",
    },
  });
  const onSubmit = (data: RepairsForm) => {
    onOpenChange(false);
    form.reset();
    toast({
      title: isUpdate
        ? "Repair updated successfully!"
        : "Repair created successfully!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        form.reset();
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>
            {isUpdate ? "Update Repair" : "Create Repair"}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the repair by providing the necessary information."
              : "Add a new repair by providing the necessary information."}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="repairs-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 flex-1"
          >
            {/* Campo: Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter repair title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a status"
                    items={[
                      { label: "Pending", value: "Pending" },
                      { label: "In Progress", value: "In Progress" },
                      { label: "Completed", value: "Completed" },
                      { label: "Canceled", value: "Canceled" },
                      { label: "On Hold", value: "On Hold" },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Label */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="space-y-3 relative">
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Documentation" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Documentation
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Feature" />
                        </FormControl>
                        <FormLabel className="font-normal">Feature</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Bug" />
                        </FormControl>
                        <FormLabel className="font-normal">Bug</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="space-y-3 relative">
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="High" />
                        </FormControl>
                        <FormLabel className="font-normal">High</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Medium" />
                        </FormControl>
                        <FormLabel className="font-normal">Medium</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Low" />
                        </FormControl>
                        <FormLabel className="font-normal">Low</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="repairs-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

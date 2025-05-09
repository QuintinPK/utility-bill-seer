
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Invoice, UtilityType } from '@/types/invoice';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface InvoicePreviewCardProps {
  invoice: Partial<Invoice>;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

const InvoicePreviewCard: React.FC<InvoicePreviewCardProps> = ({
  invoice,
  onSave,
  onCancel,
}) => {
  const form = useForm<Invoice>({
    defaultValues: {
      id: invoice.id || Math.random().toString(36).substring(2, 15),
      customerNumber: invoice.customerNumber || '',
      invoiceNumber: invoice.invoiceNumber || '',
      address: invoice.address || '',
      invoiceDate: invoice.invoiceDate || '',
      dueDate: invoice.dueDate || '',
      amount: invoice.amount || 0,
      isPaid: invoice.isPaid || false,
      utilityType: invoice.utilityType || 'water',
      fileName: invoice.fileName || '',
      pdfBlob: invoice.pdfBlob,
    },
  });

  const handleSubmit = (data: Invoice) => {
    onSave(data);
  };

  const getMissingFields = (): string[] => {
    const requiredFields: Array<keyof Invoice> = [
      'customerNumber',
      'invoiceNumber',
      'address',
      'invoiceDate',
      'dueDate',
      'amount'
    ];
    
    return requiredFields.filter(field => {
      const value = form.getValues()[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
  };

  const missingFields = getMissingFields();
  const requiredFieldsComplete = missingFields.length === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Invoice Preview</span>
          {missingFields.length > 0 ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100 flex gap-1 items-center py-1 px-3">
              <AlertTriangle className="h-4 w-4" />
              <span>{missingFields.length} missing fields</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 flex gap-1 items-center py-1 px-3">
              <Check className="h-4 w-4" />
              <span>All fields complete</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className={!field.value ? "text-red-500 flex items-center gap-1" : ""}>
                      {!field.value && <AlertTriangle className="h-3 w-3" />}
                      Customer Number {!field.value && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className={!field.value ? "text-red-500 flex items-center gap-1" : ""}>
                      {!field.value && <AlertTriangle className="h-3 w-3" />}
                      Invoice Number {!field.value && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1 md:col-span-2">
                    <FormLabel className={!field.value ? "text-red-500 flex items-center gap-1" : ""}>
                      {!field.value && <AlertTriangle className="h-3 w-3" />}
                      Address {!field.value && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className={!field.value ? "text-red-500 flex items-center gap-1" : ""}>
                      {!field.value && <AlertTriangle className="h-3 w-3" />}
                      Invoice Date {!field.value && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className={!field.value ? "text-red-500 flex items-center gap-1" : ""}>
                      {!field.value && <AlertTriangle className="h-3 w-3" />}
                      Due Date {!field.value && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className={field.value === 0 ? "text-red-500 flex items-center gap-1" : ""}>
                      {field.value === 0 && <AlertTriangle className="h-3 w-3" />}
                      Amount {field.value === 0 && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utilityType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Utility Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="water" id="water" />
                          <label htmlFor="water">Water</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="electricity" id="electricity" />
                          <label htmlFor="electricity">Electricity</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="px-0 pt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={!requiredFieldsComplete}>
                <Check className="mr-2 h-4 w-4" />
                Save Invoice
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvoicePreviewCard;

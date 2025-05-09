
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Download, CheckCircle2, XCircle, Trash2, ExternalLink } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface InvoiceDetailsDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePaid: (invoice: Invoice, paymentDate?: Date) => Promise<Invoice>;
  onDelete: (invoice: Invoice) => void;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  invoice,
  open,
  onOpenChange,
  onTogglePaid,
  onDelete,
}) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [localInvoice, setLocalInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (invoice) {
      setLocalInvoice({...invoice});
      setSelectedDate(invoice.paymentDate ? parseISO(invoice.paymentDate) : undefined);
    }
  }, [invoice]);

  if (!invoice || !localInvoice) return null;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(localInvoice.amount);

  const handleDownload = () => {
    if (localInvoice.pdfBlob) {
      const url = URL.createObjectURL(localInvoice.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = localInvoice.fileName || `invoice-${localInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleViewOriginal = () => {
    const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/${localInvoice?.invoiceNumber}`;
    window.open(gmailSearchUrl, '_blank');
  };

  const handlePaidClick = () => {
    if (!localInvoice.isPaid) {
      setShowCalendar(true);
    } else {
      handleTogglePaidStatus();
    }
  };

  const handleTogglePaidStatus = async (date?: Date) => {
    try {
      const updatedInvoice = await onTogglePaid(localInvoice, date);
      setLocalInvoice(updatedInvoice);
      
      if (date) {
        setSelectedDate(date);
      }
      
      return updatedInvoice;
    } catch (error) {
      console.error("Error updating invoice payment status:", error);
      return localInvoice;
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      handleTogglePaidStatus(date);
      setShowCalendar(false);
    }
  };

  // This function correctly formats dates from the database
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Parse the date string using parseISO to correctly handle the ISO format
      // This fixes the timezone issue causing dates to appear one day earlier
      const date = parseISO(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Invoice Details</span>
              <Badge
                variant={localInvoice?.isPaid ? "outline" : "default"}
                className={cn(
                  localInvoice?.isPaid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                )}
              >
                {localInvoice?.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {localInvoice?.utilityType === "water" ? "Water" : "Electricity"} invoice for {localInvoice?.address}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm font-medium">Customer Number:</div>
            <div className="text-sm">{localInvoice?.customerNumber}</div>
            
            <div className="text-sm font-medium">Invoice Number:</div>
            <div className="text-sm">{localInvoice?.invoiceNumber}</div>
            
            <div className="text-sm font-medium">Invoice Date:</div>
            <div className="text-sm">{localInvoice?.invoiceDate}</div>
            
            <div className="text-sm font-medium">Due Date:</div>
            <div className="text-sm">{localInvoice?.dueDate}</div>
            
            <div className="text-sm font-medium">Amount Due:</div>
            <div className={cn(
              "text-sm font-bold",
              localInvoice?.isPaid ? "line-through opacity-70" : ""
            )}>
              {formattedAmount}
            </div>

            {localInvoice?.isPaid && localInvoice.paymentDate && (
              <>
                <div className="text-sm font-medium">Payment Date:</div>
                <div className="text-sm">{formatDate(localInvoice.paymentDate)}</div>
              </>
            )}
          </div>

          <Separator />

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleViewOriginal}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View in Gmail
            </Button>
          </div>
          
          <DialogFooter className="sm:justify-between mt-6">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteAlert(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Invoice
            </Button>
            <Button
              onClick={handlePaidClick}
              variant={localInvoice?.isPaid ? "outline" : "default"}
              className={localInvoice?.isPaid ? "bg-gray-100" : ""}
            >
              {localInvoice?.isPaid ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark as Unpaid
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Paid
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(localInvoice);
                setShowDeleteAlert(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Payment Date</DialogTitle>
            <DialogDescription>
              Choose the date when the payment was made
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceDetailsDialog;

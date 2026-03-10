// src/components/peer-host/vehicles/edit-vehicle-dialog.tsx

"use client";

import { useState } from "react";
import { Save, X, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditableVehicleDetails, VehicleSpecifications } from "./edit-vehicle-types";

interface EditVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleDetails: EditableVehicleDetails;
  onSave: (updatedDetails: EditableVehicleDetails) => Promise<void>;
}

export function EditVehicleDialog({ 
  open, 
  onOpenChange, 
  vehicleDetails, 
  onSave 
}: EditVehicleDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [editableDetails, setEditableDetails] = useState<EditableVehicleDetails>(vehicleDetails);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(editableDetails);
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setEditableDetails({
        ...editableDetails,
        features: [...editableDetails.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setEditableDetails({
      ...editableDetails,
      features: editableDetails.features.filter((_, i) => i !== index)
    });
  };

  const handleSpecificationChange = (key: keyof VehicleSpecifications, value: string | number) => {
    setEditableDetails({
      ...editableDetails,
      specifications: {
        ...editableDetails.specifications,
        [key]: value
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-slate-900 dark:border-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="dark:text-white text-xl">Edit Vehicle Details</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Make changes to your vehicle information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium dark:text-slate-200 text-lg">Basic Information</h3>
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Make</Label>
                <Input
                  value={editableDetails.make}
                  onChange={(e) => setEditableDetails({...editableDetails, make: e.target.value})}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Model</Label>
                <Input
                  value={editableDetails.model}
                  onChange={(e) => setEditableDetails({...editableDetails, model: e.target.value})}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Year</Label>
                <Input
                  type="number"
                  value={editableDetails.year}
                  onChange={(e) => setEditableDetails({...editableDetails, year: parseInt(e.target.value)})}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Location</Label>
                <Input
                  value={editableDetails.location}
                  onChange={(e) => setEditableDetails({...editableDetails, location: e.target.value})}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Daily Rate ($)</Label>
                <Input
                  type="number"
                  value={editableDetails.dailyRate}
                  onChange={(e) => setEditableDetails({...editableDetails, dailyRate: parseInt(e.target.value)})}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* Description */}
          <div className="space-y-2">
            <Label className="dark:text-slate-300">Description</Label>
            <Textarea
              value={editableDetails.description}
              onChange={(e) => setEditableDetails({...editableDetails, description: e.target.value})}
              rows={4}
              className="dark:bg-slate-800 dark:border-slate-700"
            />
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="font-medium dark:text-slate-200 text-lg">Specifications</h3>
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Mileage</Label>
                <Input
                  value={editableDetails.specifications.mileage}
                  onChange={(e) => handleSpecificationChange('mileage', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Fuel Type</Label>
                <Select 
                  value={editableDetails.specifications.fuelType}
                  onValueChange={(value) => handleSpecificationChange('fuelType', value)}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Transmission</Label>
                <Select
                  value={editableDetails.specifications.transmission}
                  onValueChange={(value) => handleSpecificationChange('transmission', value)}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Seats</Label>
                <Input
                  type="number"
                  value={editableDetails.specifications.seats}
                  onChange={(e) => handleSpecificationChange('seats', parseInt(e.target.value))}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">MPG</Label>
                <Input
                  value={editableDetails.specifications.mpg}
                  onChange={(e) => handleSpecificationChange('mpg', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">AC</Label>
                <Input
                  value={editableDetails.specifications.ac}
                  onChange={(e) => handleSpecificationChange('ac', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="dark:text-slate-300">Connectivity</Label>
                <Input
                  value={editableDetails.specifications.connectivity}
                  onChange={(e) => handleSpecificationChange('connectivity', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-medium dark:text-slate-200 text-lg">Features</h3>
            <div className="flex flex-wrap gap-2">
              {editableDetails.features.map((feature, index) => (
                <Badge
                  key={index}
                  className="gap-1 dark:bg-slate-800 px-3 py-1.5 dark:text-slate-300"
                >
                  {feature}
                  <X
                    className="ml-1 w-3 h-3 hover:text-destructive cursor-pointer"
                    onClick={() => handleRemoveFeature(index)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 dark:bg-slate-800 dark:border-slate-700"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
              <Button
                onClick={handleAddFeature}
                variant="outline"
                className="dark:border-slate-700 dark:text-slate-300"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:border-slate-700 dark:text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
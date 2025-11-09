import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { ArrowLeft, Car, Settings, Edit, Check, X } from 'lucide-react';

interface ParkingSlot {
  id: string;
  slotNumber: string;
  isOccupied: boolean;
  unitNumber?: string;
  isReserved?: boolean;
}

const ParkingSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2'>('level1');
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Generate parking slots for each level (4 left, 4 right pattern)
  const generateParkingSlots = (level: string): ParkingSlot[] => {
    const slots: ParkingSlot[] = [];

    for (let row = 1; row <= 8; row++) {
      // Left side slots (1-4)
      for (let slot = 1; slot <= 4; slot++) {
        const isOccupied = Math.random() > 0.8; // Less occupied for demo
        slots.push({
          id: `${level}-L${row}-${slot}`,
          slotNumber: `${level.toUpperCase()}-L${row}-${slot}`,
          isOccupied,
          unitNumber: isOccupied ? `Unit ${Math.floor(Math.random() * 200) + 1}` : undefined,
          isReserved: Math.random() > 0.9, // Some slots reserved
        });
      }

      // Right side slots (1-4)
      for (let slot = 1; slot <= 4; slot++) {
        const isOccupied = Math.random() > 0.8; // Less occupied for demo
        slots.push({
          id: `${level}-R${row}-${slot}`,
          slotNumber: `${level.toUpperCase()}-R${row}-${slot}`,
          isOccupied,
          unitNumber: isOccupied ? `Unit ${Math.floor(Math.random() * 200) + 1}` : undefined,
          isReserved: Math.random() > 0.9, // Some slots reserved
        });
      }
    }

    return slots;
  };

  const [level1Slots, setLevel1Slots] = useState<ParkingSlot[]>(generateParkingSlots('level1'));
  const [level2Slots, setLevel2Slots] = useState<ParkingSlot[]>(generateParkingSlots('level2'));

  const getCurrentSlots = () => activeLevel === 'level1' ? level1Slots : level2Slots;
  const setCurrentSlots = (slots: ParkingSlot[]) => {
    if (activeLevel === 'level1') {
      setLevel1Slots(slots);
    } else {
      setLevel2Slots(slots);
    }
  };

  const getSlotColor = (slot: ParkingSlot) => {
    if (slot.isReserved) return 'bg-design-secondary';
    if (slot.isOccupied) return 'bg-design-primary';
    return 'bg-background text-design-primary';
  };

  const getSlotText = (slot: ParkingSlot) => {
    if (slot.isReserved) return 'RESERVED';
    if (slot.isOccupied) return slot.unitNumber || 'OCCUPIED';
    return 'AVAILABLE';
  };

  const handleSlotClick = (slot: ParkingSlot) => {
    setEditingSlot(slot);
    setIsEditDialogOpen(true);
  };


  const handleEditSlot = (updatedSlot: ParkingSlot) => {
    const currentSlots = getCurrentSlots();
    const updatedSlots = currentSlots.map(slot =>
      slot.id === updatedSlot.id ? updatedSlot : slot
    );
    setCurrentSlots(updatedSlots);
    setIsEditDialogOpen(false);
    setEditingSlot(null);
  };

  const renderParkingLayout = (slots: ParkingSlot[], levelName: string) => {
    // Group slots into rows (8 left + 8 right per row visually)
    const rows: ParkingSlot[][] = [];
    for (let i = 0; i < slots.length; i += 8) {
      rows.push(slots.slice(i, i + 8));
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-design-primary" />
            <h3 className="text-lg font-semibold text-gray-800">{levelName} Car Parking Layout</h3>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          {/* Instructions */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> Click on parking slots to edit their details and manage occupancy.
            </p>
          </div>

          {/* Legend - Moved to top */}
          <div className="mb-6 flex flex-wrap justify-center gap-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded"></div>
              <span className="text-sm text-gray-600 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-design-primary rounded border"></div>
              <span className="text-sm text-gray-600 font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-design-secondary rounded border"></div>
              <span className="text-sm text-gray-600 font-medium">Reserved</span>
            </div>
          </div>

          {/* Parking Layout */}
          <div className="space-y-6">
            {/* Group rows in pairs of 2 with container boxes */}
            {Array.from({ length: Math.ceil(rows.length / 2) }, (_, groupIndex) => {
              const startIndex = groupIndex * 2;
              const groupRows = rows.slice(startIndex, startIndex + 2);

              return (
                <div key={`group-${groupIndex}`} className="border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 bg-white">
                  {/* Render the pair of rows */}
                  <div className="space-y-3 sm:space-y-4">
                    {groupRows.map((row, rowIndex) => {
                      const actualRowIndex = startIndex + rowIndex;
                      return (
                        <div key={actualRowIndex} className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
                          {/* Left side slots (4 slots) */}
                          <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3 w-[calc(50%-0.5rem)] 2xl:justify-center 2xl:w-full">
                            {row.slice(0, 4).map((slot) => {
                              return (
                                <div key={slot.id} className="relative w-[calc(50%-0.5rem)] 2xl:w-32">
                                  {/* Parking slot */}
                                  <div
                                    className={`
                                      w-full h-24 ${getSlotColor(slot)} ${slot.isOccupied || slot.isReserved ? 'text-white' : ''} text-xs sm:text-sm font-bold
                                      rounded-lg border flex flex-wrap  items-center justify-center
                                      cursor-pointer hover:opacity-80 transition-all shadow-md relative
                                    `}
                                    onClick={() => handleSlotClick(slot)}
                                    title={`${slot.slotNumber}: ${getSlotText(slot)}`}
                                  >
                                    <div className="text-center leading-tight w-full px-1">
                                      <div className="text-xs sm:text-sm font-semibold">{slot.slotNumber.split('-')[2]}</div>
                                      {slot.isOccupied ? (
                                        <div className="text-xs sm:text-sm font-bold bg-design-white bg-opacity-20 px-1 py-0.5 rounded w-full text-center">
                                          OCCUPIED
                                        </div>
                                      ) : slot.isReserved ? (
                                        <div className="text-xs sm:text-sm">RESERVED</div>
                                      ) : (
                                        <div className="text-xs text-design-primary sm:text-sm">AVAILABLE</div>
                                      )}
                                    </div>
                                    {/* Edit icon */}
                                    <Edit className="absolute top-1 right-1 w-3 h-3 opacity-70" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Center divider with level indicator */}
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 sm:w-10 h-16 sm:h-20 md:h-24 bg-gray-400 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold transform -rotate-90 whitespace-nowrap">
                                ROW {actualRowIndex + 1}
                              </span>
                            </div>
                          </div>

                          {/* Right side slots (4 slots) */}
                          <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-3 w-[calc(50%-0.5rem)] 2xl:justify-center 2xl:w-full">
                            {row.slice(4, 8).map((slot) => {
                              return (
                                <div key={slot.id} className="relative w-[calc(50%-0.5rem)] 2xl:w-32">
                                  {/* Parking slot */}
                                  <div
                                    className={`
                                      w-full h-24 ${getSlotColor(slot)} ${slot.isOccupied || slot.isReserved ? 'text-white' : ''} text-xs sm:text-sm font-bold
                                      rounded-lg border flex flex-col items-center justify-center
                                      cursor-pointer hover:opacity-80 transition-all shadow-md relative
                                    `}
                                    onClick={() => handleSlotClick(slot)}
                                    title={`${slot.slotNumber}: ${getSlotText(slot)}`}
                                  >
                                    <div className="text-center leading-tight w-full px-1">
                                      <div className="text-xs sm:text-sm font-semibold">{slot.slotNumber.split('-')[2]}</div>
                                      {slot.isOccupied ? (
                                        <div className="text-xs sm:text-sm font-bold bg-design-white bg-opacity-20 px-1 py-0.5 rounded w-full text-center">
                                          OCCUPIED
                                        </div>
                                      ) : slot.isReserved ? (
                                        <div className="text-xs sm:text-sm">RESERVED</div>
                                      ) : (
                                        <div className="text-xs text-design-primary sm:text-sm">AVAILABLE</div>
                                      )}
                                    </div>
                                    {/* Edit icon */}
                                    <Edit className="absolute top-1 right-1 w-3 h-3 opacity-70" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-design-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parking Settings</h1>
              <p className="text-gray-600">Manage parking slots and configurations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Layout Tabs */}
      <Card className="p-6">
        <Tabs value={activeLevel} onValueChange={(value) => setActiveLevel(value as 'level1' | 'level2')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="level1" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Basement Level 1
            </TabsTrigger>
            <TabsTrigger value="level2" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Basement Level 2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="level1">
            {renderParkingLayout(level1Slots, 'Basement Level 1')}
          </TabsContent>

          <TabsContent value="level2">
            {renderParkingLayout(level2Slots, 'Basement Level 2')}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Slot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Parking Slot: {editingSlot?.slotNumber}
            </DialogTitle>
          </DialogHeader>

          {editingSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="isOccupied">Status</Label>
                  <Select
                    value={editingSlot.isOccupied ? 'occupied' : editingSlot.isReserved ? 'reserved' : 'available'}
                    onValueChange={(value) => {
                      const updated = { ...editingSlot };
                      if (value === 'occupied') {
                        updated.isOccupied = true;
                        updated.isReserved = false;
                      } else if (value === 'reserved') {
                        updated.isReserved = true;
                        updated.isOccupied = false;
                      } else {
                        updated.isOccupied = false;
                        updated.isReserved = false;
                        updated.unitNumber = undefined;
                      }
                      setEditingSlot(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    placeholder="e.g., Unit 101"
                    value={editingSlot.unitNumber || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, unitNumber: e.target.value })}
                    disabled={!editingSlot.isOccupied && !editingSlot.isReserved}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => editingSlot && handleEditSlot(editingSlot)}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParkingSettings;

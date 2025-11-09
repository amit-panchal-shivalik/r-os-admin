import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconArrowLeftToArc } from "@tabler/icons-react";

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 font-semibold">{value || "N/A"}</dd>
  </div>
);

export default function TPTab({ territory }) {
  const [selectedTP, setSelectedTP] = useState<any>(null);
  const tpData = territory.tp;

  if (!tpData || tpData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-md border border-dashed">
        <p className="text-muted-foreground">No TP data available for this territory.</p>
      </div>
    );
  }

  const handleTPSelect = (tp: any) => {
    setSelectedTP(tp);

    // Fit the map to the bounding box of the selected TP
  
  };

  return (
    <div className="">
      {/* List View */}
      {!selectedTP && (
        <div className="grid grid-cols-1">
          {tpData.map((tp: any) => (
            <Card
              key={tp._id}
              className="rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleTPSelect(tp)}
            >
              <CardContent className="p-4 ">
                {tp.tpImageBase64 ? (
                  <img
                    src={tp.tpImageBase64}
                    alt={`Map for TP ${tp.tpNumber} - ${tp.villageName}`}
                    className="rounded-lg object-cover w-full aspect-video border"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full aspect-video rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">No Image Available</span>
                  </div>
                )}
                <div className="text-lg font-semibold text-gray-800 mt-2">
                  TP {tp?.tpNumber} - {tp?.villageName}
                </div>
                <div className="text-sm text-gray-600">{tp?.tpName}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Single TP View */}
      {selectedTP && (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedTP(null)}
           
          >
            <IconArrowLeftToArc/>
          </button>
          <Card>
            <CardContent className="px-4 space-y-2">
              {selectedTP.tpImageBase64 ? (
                <img
                  src={selectedTP.tpImageBase64}
                  alt={`Map for TP ${selectedTP.tpNumber} - ${selectedTP.villageName}`}
                  className="rounded-lg object-cover w-full aspect-video border"
                />
              ) : (
                <div className="flex items-center justify-center w-full aspect-video rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">No Image Available</span>
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>TP Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <InfoItem label="TP Name" value={selectedTP.tpName} />
                    <InfoItem label="TP Number" value={selectedTP.tpNumber} />
                    <InfoItem label="Village Name" value={selectedTP.villageName} />
                    <InfoItem label="District Name" value={selectedTP.districtName} />
                    <InfoItem label="Original Plots" value={selectedTP.originalPlots} />
                    <InfoItem label="Final Plots" value={selectedTP.finalPlots} />
                    <InfoItem
                      label="Percentage Deductions"
                      value={`${selectedTP.percentageDeduction}%`}
                    />
                    <InfoItem
                      label="Plan Passing Authority"
                      value={selectedTP.planPassingAuthority}
                    />
                  </dl>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
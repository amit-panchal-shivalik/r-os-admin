import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 font-semibold">{value || "N/A"}</dd>
    </div>
);

export default function TPTab({ territory }: any) {
    const tpData = territory.tp;

    if (!tpData || tpData.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 rounded-md border border-dashed">
                <p className="text-muted-foreground">No TP data available for this territory.</p>
            </div>
        );
    }
    return (
        <Accordion type="single" collapsible className="w-full space-y-4">
            {tpData.map((tp: any) => (
                <AccordionItem key={tp._id} value={tp.tpNumber}>
                    <AccordionTrigger>
                        <span className="font-semibold px-4">TP {tp.tpNumber}</span>  {tp.villageName}
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-6 p-2">

                            {tp.tpImageBase64 ? (
                                <img
                                    src={tp.tpImageBase64}
                                    alt={`Map for TP ${tp.tpNumber} - ${tp.villageName}`}
                                    className="rounded-lg object-cover w-full aspect-video border"
                                />
                            ) : (<div className="flex items-center justify-center w-full aspect-video rounded-lg bg-muted">
                                <span className="text-sm text-muted-foreground">No Image Available</span>
                            </div>
                            )}
                            <Card>
                                <CardHeader>
                                    <CardTitle>TP Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                        <InfoItem label="TP Name" value={tp.tpName} />
                                        <InfoItem label="TP Number" value={tp.tpNumber} />
                                        <InfoItem label="Village Name" value={tp.villageName} />
                                        <InfoItem label="District Name" value={tp.districtName} />
                                        <InfoItem label="Original Plots" value={tp.originalPlots} />
                                        <InfoItem label="Final Plots" value={tp.finalPlots} />
                                        <InfoItem
                                            label="Percentage Deductions"
                                            value={`${tp.percentageDeduction}%`}
                                        />
                                        <InfoItem
                                            label="Plan Passing Authority"
                                            value={tp.planPassingAuthority}
                                        />
                                    </dl>
                                </CardContent>
                            </Card>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createBuilding, resetBuilding } from '@/store/slices/buildingSlice';
import { showMessage } from '@/utils/Constant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';

export const CreateBuildingPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { building, status, error }: any = useSelector((state: any) => state.building);

    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        // Building Details
        societyName: '',
        buildingName: '',
        territory: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        projectId: '',
        
        // Building Admin Details
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        phoneNumber: '',
    });

    useEffect(() => {
        if (status === 'complete' && building) {
            showMessage('Building created successfully');
        } else if (status === 'failed') {
            showMessage(error, 'error');
        }
    }, [status, building, error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.societyName || !formData.buildingName || !formData.address || 
            !formData.city || !formData.state || !formData.pincode) {
            showMessage('Please fill all building details', 'error');
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
            showMessage('Please fill all building admin details', 'error');
            return;
        }

        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(formData.phoneNumber)) {
            showMessage('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        dispatch(createBuilding(formData));
    };

    const handleCopyLink = () => {
        if (building?.loginLink) {
            navigator.clipboard.writeText(building.loginLink);
            setCopied(true);
            showMessage('Login link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        dispatch(resetBuilding());
        setFormData({
            societyName: '',
            buildingName: '',
            territory: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            projectId: '',
            firstName: '',
            lastName: '',
            email: '',
            countryCode: '+91',
            phoneNumber: '',
        });
    };

    if (status === 'complete' && building) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl text-center text-green-600">
                                ✓ Building Created Successfully
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-800 mb-2">Building Details</h3>
                                <div className="space-y-1 text-sm text-green-700">
                                    <p><span className="font-medium">Society:</span> {building.building.societyName}</p>
                                    <p><span className="font-medium">Building:</span> {building.building.buildingName}</p>
                                    <p><span className="font-medium">Location:</span> {building.building.city}, {building.building.state}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-800 mb-2">Building Admin Details</h3>
                                <div className="space-y-1 text-sm text-blue-700">
                                    <p><span className="font-medium">Name:</span> {building.buildingAdmin.firstName} {building.buildingAdmin.lastName}</p>
                                    <p><span className="font-medium">Email:</span> {building.buildingAdmin.email}</p>
                                    <p><span className="font-medium">Phone:</span> {building.buildingAdmin.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h3 className="font-semibold text-purple-800 mb-2">Building Admin Login Link</h3>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={building.loginLink}
                                        readOnly
                                        className="flex-1 bg-white"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleCopyLink}
                                        variant="outline"
                                        className="shrink-0"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-purple-600 mt-2">
                                    Share this link with the building admin to complete their setup
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleReset}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    Create Another Building
                                </Button>
                                <Button
                                    onClick={() => navigate('/buildings')}
                                    className="flex-1"
                                >
                                    View All Buildings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create New Building</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Building Details Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-gray-700">Building Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="societyName">Society Name *</Label>
                                        <Input
                                            id="societyName"
                                            name="societyName"
                                            value={formData.societyName}
                                            onChange={handleChange}
                                            placeholder="Enter society name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="buildingName">Building Name *</Label>
                                        <Input
                                            id="buildingName"
                                            name="buildingName"
                                            value={formData.buildingName}
                                            onChange={handleChange}
                                            placeholder="Enter building name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="territory">Territory</Label>
                                        <Input
                                            id="territory"
                                            name="territory"
                                            value={formData.territory}
                                            onChange={handleChange}
                                            placeholder="Enter territory"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Address *</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter address"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Enter city"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="Enter state"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="pincode">PIN Code *</Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="Enter PIN code"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Building Admin Details Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-gray-700">Building Admin Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="admin@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value="+91"
                                                disabled
                                                className="w-16"
                                            />
                                            <Input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                placeholder="9999999999"
                                                maxLength={10}
                                                className="flex-1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/buildings')}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={status === 'pending'}
                                    className="flex-1"
                                >
                                    {status === 'pending' ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Building'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
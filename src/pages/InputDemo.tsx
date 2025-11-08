import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FloatingInput } from '@/components/ui/floating-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export const InputDemo: React.FC = () => {
  const [regularValue, setRegularValue] = useState('');
  const [floatingValue, setFloatingValue] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-h1 font-bold">Input Field Demo</h1>
          <p className="text-h4 text-muted-foreground max-w-2xl mx-auto">
            Demonstration of regular inputs vs floating label inputs with fieldset-style animation
          </p>
        </div>

        {/* Regular Input Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h2">Regular Input Fields</CardTitle>
            <CardDescription>
              Standard input fields with traditional label positioning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="regular-name">Full Name</Label>
                <Input
                  id="regular-name"
                  placeholder="Enter your full name"
                  value={regularValue}
                  onChange={(e) => setRegularValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regular-email">Email Address</Label>
                <Input
                  id="regular-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Traditional approach: Label stays above input field
            </div>
          </CardContent>
        </Card>

        {/* Floating Input Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h2">Floating Label Inputs</CardTitle>
            <CardDescription>
              Modern floating labels that animate to the top when focused or filled. Click on any input below to see the label float up!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingInput
                id="floating-name"
                label="Full Name"
                placeholder=""
                value={floatingValue}
                onChange={(e) => setFloatingValue(e.target.value)}
              />
              <FloatingInput
                id="floating-email"
                label="Email Address"
                type="email"
                placeholder=""
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FloatingInput
                id="floating-phone"
                label="Phone Number"
                type="tel"
                placeholder=""
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <FloatingInput
                id="floating-address"
                label="Address"
                placeholder=""
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-h4 font-semibold">Features:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Label animates up when input is focused
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Label stays up when input has content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Smooth CSS transitions and animations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Enhanced focus states with primary color
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Error state support included
                </li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🧪 Test All Scenarios:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Scenario 1:</strong> Empty input - Label shows centered in middle (gray color)</li>
                <li>• <strong>Scenario 2:</strong> Click on input - Label smoothly animates UP to top border</li>
                <li>• <strong>Scenario 3:</strong> Start typing - Label stays at top, text appears in middle</li>
                <li>• <strong>Scenario 4:</strong> Delete all text & click away - Label animates DOWN to center</li>
                <li>• <strong>Scenario 5:</strong> Type again & blur - Label stays at top (has content)</li>
                <li>• Notice label color changes: Gray (center) → Primary (top)</li>
                <li>• Notice label size changes: Base (center) → Smaller (top)</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Usage:</h4>
              <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`<FloatingInput
  id="example"
  label="Example Field"
  type="text"
  placeholder=""
  value={value}
  onChange={handleChange}
  error="Optional error message"
/>`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Before (Regular)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Enter name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Enter email" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-h3">After (Floating)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FloatingInput label="Name" id="demo-name" />
                <FloatingInput label="Email" type="email" id="demo-email" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="text-center py-8">
            <h2 className="text-h2 font-bold mb-2">Global Input Enhancement</h2>
            <p className="text-h4 text-muted-foreground mb-6">
              All input fields now support floating labels with smooth animations and enhanced UX
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button variant="outline">
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

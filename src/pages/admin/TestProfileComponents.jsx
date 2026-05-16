import React from 'react';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/v2/Avatar';
import KeyValuePair from '../../components/ui/v2/KeyValuePair';
import HighlightBox from '../../components/ui/v2/HighlightBox';
import { Timeline } from '../../components/ui/v2/Timeline';
import Button from '../../components/ui/v2/Button';
import Badge from '../../components/ui/Badge';

const TestProfileComponents = () => {
  const mockTimelineItems = [
    { 
      color: "bg-primary", 
      time: "10:00 AM", 
      title: "Design System Review", 
      description: "Finalized the core atomic components for the ERP profile system." 
    },
    { 
      color: "bg-emerald-500", 
      time: "Yesterday", 
      title: "Deployment Successful", 
      description: "V2 components merged into the staging environment." 
    },
    { 
      color: "bg-amber-500", 
      time: "2 days ago", 
      title: "Security Audit", 
      description: "Completed annual security review for teacher login modules." 
    }
  ];

  return (
    <div className="p-8 space-y-10 pb-40">
      <header>
        <h1 className="text-3xl font-black text-text-main dark:text-white">Core UI V2 components</h1>
        <p className="text-text-secondary mt-2">Foundational components for profiles, dashboards, and data display.</p>
      </header>

      {/* 1. Avatars Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-main dark:text-white border-b pb-2">1. Avatar Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xs font-black uppercase text-text-secondary mb-6 tracking-widest">Sizes (XS to 2XL)</h3>
            <div className="flex items-end gap-4 flex-wrap">
              <Avatar size="xs" initials="XS" status="online" />
              <Avatar size="sm" initials="SM" status="busy" />
              <Avatar size="md" initials="MD" status="away" />
              <Avatar size="lg" initials="LG" status="offline" />
              <Avatar size="xl" initials="XL" />
              <Avatar size="2xl" initials="JD" />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-xs font-black uppercase text-text-secondary mb-6 tracking-widest">Shapes & Images</h3>
            <div className="flex items-center gap-6">
              <Avatar variant="circle" size="xl" src="https://i.pravatar.cc/150?u=1" />
              <Avatar variant="rounded" size="xl" src="https://i.pravatar.cc/150?u=2" />
              <Avatar variant="square" size="xl" src="https://i.pravatar.cc/150?u=3" />
            </div>
          </Card>
        </div>
      </section>

      {/* 2. Button Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-main dark:text-white border-b pb-2">2. Button Variants</h2>
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase text-text-secondary mb-4 tracking-widest">Styles</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="contained">Contained</Button>
                  <Button variant="outlined">Outlined</Button>
                  <Button variant="text">Text Button</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-text-secondary mb-4 tracking-widest">Icons & States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button startIcon="add">Add Item</Button>
                  <Button endIcon="arrow_forward" variant="outlined">Next Step</Button>
                  <Button loading>Processing</Button>
                  <Button disabled startIcon="lock">Disabled</Button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-text-secondary mb-4 tracking-widest">Sizes</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. KeyValuePairs Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-main dark:text-white border-b pb-2">3. KeyValuePairs (Read-Only Data)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xs font-black uppercase text-text-secondary mb-6 tracking-widest">Vertical Layout (Default)</h3>
            <div className="grid grid-cols-2 gap-6">
              <KeyValuePair label="Full Name" value="Dr. Robert Oppenheimer" icon="person" />
              <KeyValuePair label="Department" value="Quantum Physics" icon="school" />
              <KeyValuePair label="Joining Date" value="Aug 15, 1942" icon="calendar_today" />
              <KeyValuePair label="Status" value="Active" icon="verified" />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-xs font-black uppercase text-text-secondary mb-6 tracking-widest">Horizontal Layout & Sizes</h3>
            <div className="space-y-4">
              <KeyValuePair label="Small Horizontal" value="Value" layout="horizontal" size="sm" />
              <KeyValuePair label="Medium Horizontal" value="Standard Value" layout="horizontal" size="md" />
              <KeyValuePair label="Large Horizontal" value="Premium Value" layout="horizontal" size="lg" />
              <KeyValuePair label="Missing Data" value={null} layout="horizontal" fallback="Not Provided" />
            </div>
          </Card>
        </div>
      </section>

      {/* 4. HighlightBoxes Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-main dark:text-white border-b pb-2">4. HighlightBoxes (Metrics & Snapshots)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox 
            variant="primary" 
            icon="payments" 
            label="Total Earnings" 
            value="$128,450.00" 
            trailingNode={<button className="text-primary text-xs font-bold uppercase underline">Withdraw</button>} 
          />
          <HighlightBox 
            variant="success" 
            icon="check_circle" 
            label="Attendance Rate" 
            value="98.4%" 
            trailingNode={<Badge variant="success">Excellent</Badge>} 
          />
          <HighlightBox 
            variant="warning" 
            icon="pending" 
            label="Pending Leaves" 
            value="04 Days" 
          />
          <HighlightBox 
            variant="neutral" 
            icon="event" 
            label="Next Payout" 
            value="Nov 30, 2023" 
          />
        </div>
      </section>

      {/* 5. Timeline Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-main dark:text-white border-b pb-2">5. Timeline (Audit Logs)</h2>
        <Card className="p-8">
          <h3 className="text-xs font-black uppercase text-text-secondary mb-8 tracking-widest">Recent Activity</h3>
          <Timeline items={mockTimelineItems} />
        </Card>
      </section>
    </div>
  );
};

export default TestProfileComponents;

import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const SuggestionsReviewSheetPage = createEhsPage({
  title: 'Suggestions Review Sheet',
  description: 'Capture workforce suggestions, evaluate practicality, and communicate decisions with timelines.',
  primaryActionLabel: 'Add Suggestion',
  metrics: [
    { label: 'Suggestions received (YTD)', value: '36', status: 'info', helperText: 'Encourage more participation' },
    { label: 'Implemented ideas', value: '14', status: 'success', helperText: '39% conversion' },
    { label: 'Under evaluation', value: '7', status: 'warning', helperText: 'Review meeting next week' }
  ],
  table: {
    columns: [
      { key: 'ref', label: 'Suggestion ID' },
      { key: 'submittedBy', label: 'Submitted By' },
      { key: 'idea', label: 'Idea Summary' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        ref: 'SG/2025/012',
        submittedBy: 'Mukesh Verma',
        idea: 'Dedicated material walkway',
        status: <Badge color="green">Implemented</Badge>
      },
      {
        ref: 'SG/2025/009',
        submittedBy: 'Seema Jain',
        idea: 'QR code for toolbox content',
        status: <Badge color="yellow">Under Review</Badge>
      },
      {
        ref: 'SG/2025/006',
        submittedBy: 'Ravi Sahu',
        idea: 'Night shift hydration points',
        status: <Badge color="blue">Planned</Badge>
      }
    ],
    emptyMessage: 'No suggestions captured yet.'
  }
});

export default SuggestionsReviewSheetPage;

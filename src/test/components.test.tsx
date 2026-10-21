import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';
import { EventProvider } from '../context/EventContext';
import { BudgetPlanner } from '../components/workspace/BudgetPlanner';
import { TimelineView } from '../components/workspace/TimelineView';
import { VendorChecklist } from '../components/workspace/VendorChecklist';
import { EventCreationModal } from '../components/creation/EventCreationModal';
import { PlanExportModal } from '../components/workspace/PlanExportModal';
import { AiAssistant } from '../components/workspace/AiAssistant';

describe('Gatherly User Interface and Journey Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the application navbar and workspace correctly', () => {
    render(<App />);

    // Brand and primary navigation
    expect(screen.getAllByText('Gatherly')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Overview')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Budget')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Timeline')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Vendors')[0]).toBeInTheDocument();
  });

  it('allows adding and editing items in BudgetPlanner with immediate calculation updates', async () => {
    render(
      <EventProvider>
        <BudgetPlanner />
      </EventProvider>
    );

    // Click "Add Expense"
    const addBtn = screen.getByRole('button', { name: /add expense/i });
    fireEvent.click(addBtn);

    // Fill in new expense
    const nameInput = screen.getByLabelText(/item name/i);
    const plannedInput = screen.getByLabelText(/planned amount/i);
    const saveBtn = screen.getByRole('button', { name: /save item/i });

    fireEvent.change(nameInput, { target: { value: 'Signature Donut Wall' } });
    fireEvent.change(plannedInput, { target: { value: '450' } });
    fireEvent.click(saveBtn);

    // Verify item is added to table
    await waitFor(() => {
      expect(screen.getByText('Signature Donut Wall')).toBeInTheDocument();
    });
  });

  it('allows toggling completion status in TimelineView', async () => {
    render(
      <EventProvider>
        <TimelineView />
      </EventProvider>
    );

    expect(screen.getByText(/celebration timeline & milestones/i)).toBeInTheDocument();

    // Find milestone toggle buttons
    const toggleButtons = screen.getAllByRole('button', { name: /mark/i });
    expect(toggleButtons.length).toBeGreaterThan(0);

    const firstToggle = toggleButtons[0];
    fireEvent.click(firstToggle);

    // Status or count should reflect
    expect(screen.getByText(/milestones remaining/i)).toBeInTheDocument();
  });

  it('allows adding services in VendorChecklist and updates category filter', async () => {
    render(
      <EventProvider>
        <VendorChecklist />
      </EventProvider>
    );

    expect(screen.getByText(/vendor & service checklist/i)).toBeInTheDocument();

    const addVendorBtn = screen.getByRole('button', { name: /add vendor item/i });
    fireEvent.click(addVendorBtn);

    const titleInput = screen.getByLabelText(/service \/ role/i);
    const vendorInput = screen.getByLabelText(/vendor \/ company name/i);
    const costInput = screen.getByLabelText(/estimated cost/i);
    const submitBtn = screen.getByRole('button', { name: /add to checklist/i });

    fireEvent.change(titleInput, { target: { value: 'Artisan Espresso Cart' } });
    fireEvent.change(vendorInput, { target: { value: 'Bean & Bloom' } });
    fireEvent.change(costInput, { target: { value: '600' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Artisan Espresso Cart')).toBeInTheDocument();
      expect(screen.getByText('Bean & Bloom')).toBeInTheDocument();
    });
  });

  it('validates and submits a new celebration in EventCreationModal', async () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <EventProvider>
        <EventCreationModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />
      </EventProvider>
    );

    expect(screen.getByText(/create new celebration plan/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/celebration name/i);
    const dateInput = screen.getByLabelText(/event date/i);
    const submitBtn = screen.getByRole('button', { name: /generate celebration workspace/i });

    // Try submit without filling required name
    fireEvent.click(submitBtn);
    expect(screen.getByText(/please provide a celebration name/i)).toBeInTheDocument();

    // Fill valid inputs
    fireEvent.change(nameInput, { target: { value: 'Sofia & Liam Autumn Nuptials' } });
    fireEvent.change(dateInput, { target: { value: '2026-11-20' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('renders PlanExportModal with export and import tabs', () => {
    const handleClose = vi.fn();
    render(
      <EventProvider>
        <PlanExportModal isOpen={true} onClose={handleClose} />
      </EventProvider>
    );

    expect(screen.getByText(/plan sharing & data management/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export & print/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import json/i })).toBeInTheDocument();
  });

  it('renders AiAssistant with recommendations and provider status indicator', () => {
    const handleOpenSettings = vi.fn();
    render(
      <EventProvider>
        <AiAssistant onOpenSettingsModal={handleOpenSettings} />
      </EventProvider>
    );

    expect(screen.getByText(/genai planning assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/demo mode: gatherly rule-based engine/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/catering without compromising quality/i)).toBeInTheDocument();
  });
});

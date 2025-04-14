# SalesApprovals Component

Here's how I would structure this within your system:

Purpose

The sales_approvals table would create a staging area where estimates wait for manager review before being sent to customers. This ensures:

Quality control on pricing and discounts
Consistency in customer communications
Opportunities for coaching and feedback
Compliance with company policies

New Table: sales_approvals
sqlCREATE TABLE public.sales_approvals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid REFERENCES public.documents(id),
    requestor_id uuid REFERENCES public.users(id),
    approver_id uuid REFERENCES public.users(id),
    status varchar(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    requested_at timestamptz DEFAULT now(),
    responded_at timestamptz,
    notes text,
    rejection_reason text,
    approval_rules_applied jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sales_approvals_document ON public.sales_approvals(document_id);
CREATE INDEX idx_sales_approvals_requestor ON public.sales_approvals(requestor_id);
CREATE INDEX idx_sales_approvals_approver ON public.sales_approvals(approver_id);
CREATE INDEX idx_sales_approvals_status ON public.sales_approvals(status);

COMMENT ON TABLE public.sales_approvals IS 'Approval workflow for estimates before presentation to customers';
Workflow Integration

Request Submission

When a sales rep completes an estimate, they can click "Submit for Approval"
System creates a record in sales_approvals with status "PENDING"
Document status is updated to "PENDING_APPROVAL"


Manager Queue

Managers see pending approvals in their dashboard
They can view complete estimates and all components
They can see pricing, discounts, and margin calculations


Approval Actions

Approve: Updates status to "APPROVED", document becomes available for presentation
Reject: Updates status to "REJECTED" with reason, returns to sales rep for revision
Request Changes: Similar to rejection but with specific change requests


Notifications

System notifies sales rep when estimate is approved/rejected
Managers receive alerts about pending approvals
Escalation notifications if approvals are pending too long


Reporting & Analytics

Track approval rates by sales rep
Monitor time-to-approval metrics
Identify common rejection reasons for training opportunities



Approval Rules
For additional sophistication, you could implement automatic approval rules:
sqlCREATE TABLE public.approval_rules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    description text,
    conditions jsonb NOT NULL, -- e.g., {"discount_percentage": {"max": 10}}
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.approval_rules IS 'Rules determining when estimates require approval';
This would allow automatic approval of estimates that meet certain criteria (e.g., discount below threshold, margin above minimum), streamlining the process for straightforward cases.
This approval system would significantly enhance your estimate workflow, providing management visibility and control while establishing a structured process for quality assurance.
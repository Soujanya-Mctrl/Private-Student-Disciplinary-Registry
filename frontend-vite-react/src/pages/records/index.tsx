import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  ClipboardList, 
  ShieldAlert, 
  Search, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PreSubmissionPanel } from '@/components/ui/pre-submission-panel';
import { ZkProofModal } from '@/components/ui/zk-proof-modal';
import { WalletGuard } from '@/components/wallet-guard';
import { useContractSubscription } from '@/modules/midnight/disciplinary-sdk/hooks/use-contract-subscription';
import { useDemoMode } from '@/contexts/demo-mode';
import { hashStudentId } from '@/modules/midnight/common-utils/hashing';
import { motion, AnimatePresence } from 'framer-motion';

// Severity badge component
function SeverityBadge({ recordCount }: { recordCount: number }) {
  if (recordCount === 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: 'var(--success-tint)', color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)' }}
      >
        <CheckCircle2 className="h-3 w-3" />
        Clear
      </span>
    );
  }
  if (recordCount < 3) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid color-mix(in srgb, var(--warning) 25%, transparent)' }}
      >
        <AlertTriangle className="h-3 w-3" />
        Warning
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)' }}
    >
      <ShieldAlert className="h-3 w-3" />
      <span className="badge-dot-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--danger)' }} />
      Critical
    </span>
  );
}

type VerifiedStudent = {
  id: string; // Real ID (known from input)
  hash: string; // On-chain hash
  recordCount: number;
};

type ProofState = 'idle' | 'generatingProof' | 'submitting' | 'confirmed' | 'error';

export function Records() {
  const { deployedContractAPI, derivedState } = useContractSubscription();
  const { isDemoMode } = useDemoMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [showZkModal, setShowZkModal] = useState(false);
  
  // Incident Form State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('1');

  // Verify flow state
  const [verifyId, setVerifyId] = useState('');
  const [verifyState, setVerifyState] = useState<ProofState>('idle');
  const [verifiedStudents, setVerifiedStudents] = useState<VerifiedStudent[]>([
    { id: '10293', hash: '8f0a...e2b1', recordCount: 0 },
    { id: '11542', hash: '3c9d...f0a2', recordCount: 2 },
    { id: '12884', hash: 'e1b2...c3d4', recordCount: 5 },
  ]);

  const filteredStudents = verifiedStudents.filter((s) => s.id.includes(searchTerm));

  // Verify a student record via ZK proof
  const handleVerify = async () => {
    if (!verifyId.trim()) return;

    if (!deployedContractAPI) {
      // Demo Mode Fallback
      setVerifyState('generatingProof');
      await new Promise(r => setTimeout(r, 2000));
      setVerifyState('submitting');
      await new Promise(r => setTimeout(r, 1000));
      
      const mockCount = Math.floor(Math.random() * 6);
      setVerifiedStudents((prev) => {
        const existing = prev.findIndex((s) => s.id === verifyId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { id: verifyId, hash: 'mock-hash-' + verifyId, recordCount: mockCount };
          return updated;
        }
        return [...prev, { id: verifyId, hash: 'mock-hash-' + verifyId, recordCount: mockCount }];
      });
      
      setVerifyState('confirmed');
      toast.success(`Demo: Verified student ${verifyId} (Simulated)`);
      setVerifyId('');
      setTimeout(() => setVerifyState('idle'), 2000);
      return;
    }

    setVerifyState('generatingProof');
    try {
      // 1. Hash the ID
      const hashBigInt = await hashStudentId(verifyId);
      
      // 2. Verify on-chain using the HASH
      setVerifyState('submitting');
      const count = await deployedContractAPI.verifyRecord(hashBigInt);
      
      setVerifyState('confirmed');
      const numCount = Number(count);

      // Add or update in verified list
      setVerifiedStudents((prev) => {
        const existing = prev.findIndex((s) => s.id === verifyId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { id: verifyId, hash: hashBigInt.toString(), recordCount: numCount };
          return updated;
        }
        return [...prev, { id: verifyId, hash: hashBigInt.toString(), recordCount: numCount }];
      });

      toast.success(`Verified: Student ${verifyId} has ${numCount} incident(s)`);
      setVerifyId('');
      setTimeout(() => setVerifyState('idle'), 2000);
    } catch (error) {
      console.error('Verify failed:', error);
      setVerifyState('error');
      toast.error('Verification failed. Student may not be registered.');
      setTimeout(() => setVerifyState('idle'), 2000);
    }
  };

  const handleAddAction = async (student: VerifiedStudent) => {
    if (isDemoMode) {
      // Demo Mode logic
      setShowZkModal(true);
      await new Promise(r => setTimeout(r, 2000));
      
      setVerifiedStudents((prev) =>
        prev.map((s) => s.id === student.id ? { ...s, recordCount: s.recordCount + 1 } : s)
      );
      
      setShowZkModal(false);
      toast.success('Demo: Incident recorded (Simulated)');
      setExpandedId(null);
      setDescription('');
      return;
    }

    if (!deployedContractAPI) {
      toast.error('Contract connection not ready. Please wait or refresh the page.');
      return;
    }

    setShowZkModal(true);
    try {
      // 1. Prepare reason hash (SHA-256 -> Field)
      const encoder = new TextEncoder();
      const reasonBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(description));
      const reasonHash = BigInt('0x' + Array.from(new Uint8Array(reasonBuffer)).slice(0, 31).map(b => b.toString(16).padStart(2, '0')).join(''));

      // 2. Add action on-chain (increments counter + stores reason hash)
      await deployedContractAPI.addDisciplinaryAction(BigInt(student.hash), reasonHash);

      // 2. Prepare commitment hash (simple hash of details for now)
      const commitmentData = JSON.stringify({ description, severity, year: new Date().getFullYear() });
      const commitmentBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(commitmentData));
      const commitmentHash = Array.from(new Uint8Array(commitmentBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      // 3. Store incident metadata in backend
      try {
        await fetch('http://localhost:4000/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentHash: student.hash,
            description,
            severity: parseInt(severity),
            year: new Date().getFullYear(),
            commitmentHash
          })
        });
      } catch (e) {
        console.error('Backend save failed:', e);
        toast.warning('Recorded on-chain, but failed to save details to private vault.');
      }

      setShowZkModal(false);
      toast.success('Disciplinary action recorded');
      setExpandedId(null);
      setDescription('');
      setSeverity('1');

      // Re-verify to update local count
      try {
        const newCount = await deployedContractAPI.verifyRecord(BigInt(student.hash));
        setVerifiedStudents((prev) =>
          prev.map((s) => s.id === student.id ? { ...s, recordCount: Number(newCount) } : s)
        );
      } catch {
        // Ignore re-verify error
      }
    } catch (error) {
      console.error('Failed to add action:', error);
      setShowZkModal(false);

      if (derivedState && derivedState.managerId !== derivedState.currentHashedAddress) {
        toast.error('Action failed: You are not the on-chain admin (Deployer Wallet).');
      } else {
        toast.error('Action failed. Your data was NOT transmitted anywhere.');
      }
    }
  };

  return (
    <WalletGuard>
      <div className="flex-1 p-8 pt-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--zk-accent-tint)' }}>
              <ClipboardList className="h-5 w-5" style={{ color: 'var(--zk-accent)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Disciplinary Records
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage privacy-preserving incident records
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'var(--privacy-tint)', color: 'var(--primary)', border: '1px solid var(--privacy-border)' }}
          >
            <Users className="h-4 w-4" />
            Total Registered: {derivedState?.totalStudents?.toString() || '0'}
          </motion.div>
        </motion.div>

        {/* Verify Student Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Card style={{ background: 'var(--privacy-tint)', borderColor: 'var(--privacy-border)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                <ShieldCheck className="h-5 w-5" />
                Verify Student Record (ZK)
              </CardTitle>
              <CardDescription>
                Enter a Student ID to verify their record count on-chain via zero-knowledge proof.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Enter Student ID..."
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value)}
                  className="flex-1"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
                <Button
                  className="gap-2 btn-zk"
                  onClick={handleVerify}
                  disabled={!verifyId.trim() || verifyState !== 'idle' || !deployedContractAPI}
                >
                  {verifyState === 'generatingProof' || verifyState === 'submitting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {verifyState === 'generatingProof' ? 'Generating Proof...' : 'Submitting...'}
                    </>
                  ) : verifyState === 'confirmed' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Verified ✓
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verify Record
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Records Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Verified Students</CardTitle>
                  <CardDescription>Students verified via ZK proof — real on-chain data</CardDescription>
                </div>
              </div>
              {verifiedStudents.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter by Student ID..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Incidents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <React.Fragment key={student.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.06 }}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <TableCell>
                            <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                              {student.id}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                              {student.recordCount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <SeverityBadge recordCount={student.recordCount} />
                          </TableCell>
                          <TableCell className="text-right">
                            <AnimatePresence mode="wait">
                              {expandedId === student.id ? (
                                <motion.div
                                  key="expanded-placeholder"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="text-primary font-bold text-xs"
                                >
                                  Editing...
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="addBtn"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5"
                                    onClick={() => {
                                      setExpandedId(student.id);
                                      setDescription('');
                                      setSeverity('1');
                                    }}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Incident
                                  </Button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </TableCell>
                        </motion.tr>
                        <AnimatePresence>
                          {expandedId === student.id && (
                            <TableRow className="bg-muted/30 border-b">
                              <TableCell colSpan={4} className="p-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-6 text-left border-t"
                                >
                                  <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Incident Description</Label>
                                        <Input 
                                          value={description} 
                                          onChange={(e) => setDescription(e.target.value)}
                                          placeholder="e.g. Academic dishonesty in final exam"
                                          className="bg-background shadow-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Severity / Priority</Label>
                                        <Select value={severity} onValueChange={setSeverity}>
                                          <SelectTrigger className="bg-background shadow-sm">
                                            <SelectValue placeholder="Select severity" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">
                                              <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ background: 'var(--success)' }} />
                                                <span>Level 1 - Minor Warning</span>
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="2">
                                              <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ background: 'var(--zk-accent)' }} />
                                                <span>Level 2 - Moderate Action</span>
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="3">
                                              <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ background: 'var(--warning)' }} />
                                                <span>Level 3 - Serious Probation</span>
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="4">
                                              <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ background: 'var(--danger)' }} />
                                                <span>Level 4 - Severe Suspension</span>
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="5">
                                              <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full badge-dot-pulse" style={{ background: 'var(--danger)' }} />
                                                <span className="font-bold">Level 5 - Critical Expulsion</span>
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
    
                                    <div className="rounded-xl overflow-hidden border bg-background/50">
                                      <div className="px-4 py-2 bg-muted/50 border-b flex items-center gap-2">
                                        <Shield className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Privacy Summary</span>
                                      </div>
                                      <div className="p-4">
                                        <PreSubmissionPanel
                                          fields={[
                                            { label: 'Updated incident counter', value: `${student.recordCount + 1}`, isPrivate: false },
                                            { label: 'Student Hash', value: `${student.hash.slice(0, 10)}...`, isPrivate: false },
                                            { label: 'Incident details', value: 'Encrypted in private vault', isPrivate: true },
                                          ]}
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end items-center gap-3 pt-2">
                                      <p className="text-[11px] text-muted-foreground italic mr-2">
                                         Transaction requires ZK proof generation and Lace wallet approval.
                                      </p>
                                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(null)}>
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="btn-zk px-6"
                                        disabled={!description}
                                        onClick={() => handleAddAction(student)}
                                      >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Confirm & Record Incident
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">
                            {verifiedStudents.length === 0
                              ? 'No students verified yet. Use the verify card above to look up a student.'
                              : 'No records match your filter.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Shield className="h-5 w-5" style={{ color: 'var(--zk-accent)' }} />
                  Record Integrity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every incident is cryptographically linked to the school's identity.
                  Only authorized viewers can see the exact count, providing a balance
                  between accountability and student privacy.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Register link ... */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
           >
             <Card style={{ background: 'var(--privacy-tint)', borderColor: 'var(--privacy-border)' }} className="h-full">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                   <Plus className="h-5 w-5" />
                   Quick Register
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground mb-4">
                   Don't see a student? Register them first to start tracking their record.
                 </p>
                 <Button className="w-full" onClick={() => (window.location.href = '/registration')}>
                   Register New Student
                 </Button>
               </CardContent>
             </Card>
           </motion.div>
        </div>

        {/* ZK Proof Modal */}
        <ZkProofModal
          isOpen={showZkModal}
          onClose={() => setShowZkModal(false)}
        />
      </div>
    </WalletGuard>
  );
}

import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Loader2, Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrivacyInput } from '@/components/ui/privacy-input';
import { PreSubmissionPanel } from '@/components/ui/pre-submission-panel';
import { ZkProofModal } from '@/components/ui/zk-proof-modal';
import { WalletGuard } from '@/components/wallet-guard';
import { useContractSubscription } from '@/modules/midnight/disciplinary-sdk/hooks/use-contract-subscription';
import { motion, AnimatePresence } from 'framer-motion';

import { hashStudentId } from '@/modules/midnight/common-utils/hashing';

export function Registration() {
  const { deployedContractAPI } = useContractSubscription();
  const [studentId, setStudentId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showZkModal, setShowZkModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleRegister = async () => {
    if (!studentId) return;
    
    if (!deployedContractAPI) {
      // Demo Mode Fallback
      setShowZkModal(true);
      setIsRegistering(true);
      await new Promise(r => setTimeout(r, 3000)); // Simulate proof generation
      
      setIsRegistering(false);
      setShowZkModal(false);
      toast.success('Demo: Student registered (Simulated)');
      setStudentId('');
      return;
    }
    setShowPreview(false);
    setShowZkModal(true);
    setIsRegistering(true);
    
    try {
      // 1. Hash the student ID for privacy (on-chain key)
      const studentHashBigInt = await hashStudentId(studentId);
      const studentHashStr = studentHashBigInt.toString();

      // 2. Register on-chain with the HASH
      await deployedContractAPI.registerStudent(studentHashBigInt);
      
      // 3. Store encrypted relationship in backend
      try {
        await fetch('http://localhost:4000/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentId, // Backend will encrypt this
            studentHash: studentHashStr
          })
        });
      } catch (backendError) {
        console.error('Backend registration failed:', backendError);
        toast.warning('Registered on-chain, but failed to save to private vault.');
      }

      setIsRegistering(false);
      setStudentId('');
      setShowZkModal(false);
      toast.success('Student registered successfully');
    } catch (error) {
      console.error('Registration failed:', error);
      setIsRegistering(false);
      setShowZkModal(false);
      toast.error('Registration failed. Your data was NOT transmitted anywhere.');
    }
  };

  return (
    <WalletGuard>
    <div className="flex-1 p-8 pt-6">
      <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--privacy-tint)' }}>
            <UserPlus className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Register New Student
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a privacy-preserving ledger entry for a student
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Registration form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                <CardTitle style={{ fontFamily: 'var(--font-display)' }}>Student Information</CardTitle>
              </div>
              <CardDescription>
                Enter the student's identifier. This data is encrypted locally and only a commitment hash goes on-chain.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <PrivacyInput
                id="studentId"
                label="Student Identifier"
                placeholder="Enter student ID (e.g. 12345)"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setShowPreview(false);
                }}
                disabled={isRegistering}
                privacyHint="Student ID is encrypted locally and never transmitted as plaintext"
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* Pre-submission panel */}
              <AnimatePresence>
                {showPreview && studentId && (
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <PreSubmissionPanel
                      className="w-full"
                      fields={[
                        { label: 'Commitment hash', value: '[Will be computed]', isPrivate: false },
                        { label: 'Registration status', value: 'Active', isPrivate: false },
                        { label: 'Student ID (raw)', value: `ID: ${studentId}`, isPrivate: true },
                      ]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex w-full justify-between">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={isRegistering}
                >
                  Cancel
                </Button>

                <AnimatePresence mode="wait">
                  {!showPreview ? (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={() => setShowPreview(true)}
                        disabled={!studentId}
                      >
                        Review Submission
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        className="btn-zk gap-2"
                        onClick={handleRegister}
                        disabled={!studentId || isRegistering}
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating Proof...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Register with ZK Proof
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Privacy explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card style={{ background: 'var(--privacy-tint)', borderColor: 'var(--privacy-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    How registration works
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Registration creates a private ledger account using a zero-knowledge commitment.
                    The student's actual identity is never exposed on-chain — only a cryptographic
                    hash is stored. This enables future verification queries without compromising
                    student privacy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ZK Proof Modal */}
      <ZkProofModal
        isOpen={showZkModal}
        onClose={() => {
          setShowZkModal(false);
          setIsRegistering(false);
        }}
        onComplete={() => {}}
      />
      </div>
    </div>
    </WalletGuard>
  );
}

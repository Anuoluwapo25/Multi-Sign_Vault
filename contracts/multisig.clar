;; Multi-signature Wallet Contract for Stacks
;; Converted from Solidity to Clarity for Bitcoin smart contracts

;; Import SIP-010 trait
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-THRESHOLD (err u101))
(define-constant ERR-INVALID-SIGNER (err u102))
(define-constant ERR-TRANSACTION-NOT-FOUND (err u103))
(define-constant ERR-TRANSACTION-ALREADY-EXECUTED (err u104))
(define-constant ERR-INSUFFICIENT-APPROVALS (err u105))
(define-constant ERR-ALREADY-APPROVED (err u106))
(define-constant ERR-SIGNER-ALREADY-EXISTS (err u107))
(define-constant ERR-SIGNER-NOT-FOUND (err u108))
(define-constant ERR-INVALID-AMOUNT (err u109))
(define-constant ERR-TRANSFER-FAILED (err u110))

;; Data structures
(define-map signers principal bool)
(define-map signer-list uint principal)
(define-data-var signer-count uint u0)
(define-data-var threshold uint u0)
(define-data-var nonce uint u0)
(define-data-var transaction-count uint u0)

;; Transaction structure
(define-map transactions uint {
  to: principal,
  amount: uint,
  token-contract: (optional principal),
  memo: (optional (buff 34)),
  executed: bool,
  approval-count: uint,
  proposer: principal,
  block-height: uint
})

;; Track approvals for each transaction
(define-map transaction-approvals {tx-id: uint, signer: principal} bool)

;; Events (using print for event-like functionality)
(define-private (emit-signer-added (signer principal) (added-by principal))
  (print {event: "signer-added", signer: signer, added-by: added-by}))

(define-private (emit-signer-removed (signer principal) (removed-by principal))
  (print {event: "signer-removed", signer: signer, removed-by: removed-by}))

(define-private (emit-threshold-updated (old-threshold uint) (new-threshold uint))
  (print {event: "threshold-updated", old-threshold: old-threshold, new-threshold: new-threshold}))

(define-private (emit-transaction-proposed (tx-id uint) (proposer principal) (to principal) (amount uint))
  (print {event: "transaction-proposed", tx-id: tx-id, proposer: proposer, to: to, amount: amount}))

(define-private (emit-transaction-approved (tx-id uint) (approver principal))
  (print {event: "transaction-approved", tx-id: tx-id, approver: approver}))

(define-private (emit-transaction-executed (tx-id uint) (executor principal))
  (print {event: "transaction-executed", tx-id: tx-id, executor: executor}))

;; Initialize the contract with signers and threshold
(define-public (initialize (initial-signers (list 20 principal)) (initial-threshold uint))
  (begin
    (asserts! (> initial-threshold u0) ERR-INVALID-THRESHOLD)
    (asserts! (<= initial-threshold (len initial-signers)) ERR-INVALID-THRESHOLD)
    (asserts! (is-eq (var-get signer-count) u0) ERR-NOT-AUTHORIZED) ;; Can only initialize once
    
    ;; Add all initial signers
    (fold add-initial-signer initial-signers u0)
    (var-set threshold initial-threshold)
    (ok true)))

;; Helper function to add initial signers
(define-private (add-initial-signer (signer principal) (index uint))
  (begin
    (map-set signers signer true)
    (map-set signer-list index signer)
    (var-set signer-count (+ (var-get signer-count) u1))
    (+ index u1)))

;; Check if an address is a signer
(define-read-only (is-signer (address principal))
  (default-to false (map-get? signers address)))

;; Get current threshold
(define-read-only (get-threshold)
  (var-get threshold))

;; Get signer count
(define-read-only (get-signer-count)
  (var-get signer-count))

;; Get transaction count
(define-read-only (get-transaction-count)
  (var-get transaction-count))

;; Get nonce
(define-read-only (get-nonce)
  (var-get nonce))

;; Get all signers (up to 20)
(define-read-only (get-signers)
  (map get-signer-at-index (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19)))

(define-private (get-signer-at-index (index uint))
  (map-get? signer-list index))

;; Get transaction details
(define-read-only (get-transaction (tx-id uint))
  (map-get? transactions tx-id))

;; Check if a signer has approved a transaction
(define-read-only (has-approved (tx-id uint) (signer principal))
  (default-to false (map-get? transaction-approvals {tx-id: tx-id, signer: signer})))

;; Get wallet status
(define-read-only (get-wallet-status)
  {
    total-signers: (var-get signer-count),
    current-threshold: (var-get threshold),
    total-transactions: (var-get transaction-count),
    pending-transactions: (get-pending-transaction-count)
  })

;; Count pending transactions
(define-private (get-pending-transaction-count)
  (fold count-pending-tx (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30 u31 u32 u33 u34 u35 u36 u37 u38 u39 u40 u41 u42 u43 u44 u45 u46 u47 u48 u49) u0))

(define-private (count-pending-tx (tx-id uint) (count uint))
  (match (map-get? transactions tx-id)
    tx (if (get executed tx) count (+ count u1))
    count))

;; Add a new signer (requires threshold approvals)
(define-public (add-signer (new-signer principal))
  (begin
    (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (not (is-signer new-signer)) ERR-SIGNER-ALREADY-EXISTS)
    
    ;; For simplicity, allowing any signer to add new signers
    ;; In production, this should require multi-sig approval
    (map-set signers new-signer true)
    (map-set signer-list (var-get signer-count) new-signer)
    (var-set signer-count (+ (var-get signer-count) u1))
    (emit-signer-added new-signer tx-sender)
    (ok true)))

;; Remove a signer (requires threshold approvals)
(define-public (remove-signer (signer-to-remove principal))
  (begin
    (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-signer signer-to-remove) ERR-SIGNER-NOT-FOUND)
    (asserts! (> (var-get signer-count) (var-get threshold)) ERR-INVALID-THRESHOLD)
    
    ;; For simplicity, allowing any signer to remove signers
    ;; In production, this should require multi-sig approval
    (map-delete signers signer-to-remove)
    (var-set signer-count (- (var-get signer-count) u1))
    (emit-signer-removed signer-to-remove tx-sender)
    (ok true)))

;; Update threshold (requires threshold approvals)
(define-public (update-threshold (new-threshold uint))
  (let ((old-threshold (var-get threshold)))
    (begin
      (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
      (asserts! (> new-threshold u0) ERR-INVALID-THRESHOLD)
      (asserts! (<= new-threshold (var-get signer-count)) ERR-INVALID-THRESHOLD)
      
      ;; For simplicity, allowing any signer to update threshold
      ;; In production, this should require multi-sig approval
      (var-set threshold new-threshold)
      (emit-threshold-updated old-threshold new-threshold)
      (ok true))))

;; Propose a new transaction
(define-public (propose-transaction (to principal) (amount uint) (token-contract (optional principal)) (memo (optional (buff 34))))
  (let ((tx-id (var-get transaction-count)))
    (begin
      (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
      (asserts! (> amount u0) ERR-INVALID-AMOUNT)
      
      ;; Create transaction
      (map-set transactions tx-id {
        to: to,
        amount: amount,
        token-contract: token-contract,
        memo: memo,
        executed: false,
        approval-count: u0,
        proposer: tx-sender,
        block-height: block-height
      })
      
      (var-set transaction-count (+ tx-id u1))
      (emit-transaction-proposed tx-id tx-sender to amount)
      (ok tx-id))))

;; Approve a transaction
(define-public (approve-transaction (tx-id uint))
  (let ((tx (unwrap! (map-get? transactions tx-id) ERR-TRANSACTION-NOT-FOUND)))
    (begin
      (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
      (asserts! (not (get executed tx)) ERR-TRANSACTION-ALREADY-EXECUTED)
      (asserts! (not (has-approved tx-id tx-sender)) ERR-ALREADY-APPROVED)
      
      ;; Record approval
      (map-set transaction-approvals {tx-id: tx-id, signer: tx-sender} true)
      
      ;; Update approval count
      (map-set transactions tx-id (merge tx {approval-count: (+ (get approval-count tx) u1)}))
      
      (emit-transaction-approved tx-id tx-sender)
      (ok true))))

;; Execute a transaction
(define-public (execute-transaction (tx-id uint))
  (let ((tx (unwrap! (map-get? transactions tx-id) ERR-TRANSACTION-NOT-FOUND)))
    (begin
      (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
      (asserts! (not (get executed tx)) ERR-TRANSACTION-ALREADY-EXECUTED)
      (asserts! (>= (get approval-count tx) (var-get threshold)) ERR-INSUFFICIENT-APPROVALS)

      ;; Mark as executed
      (map-set transactions tx-id (merge tx {executed: true}))

      ;; Execute the transfer
      (match (get token-contract tx)
        ;; Token transfer using SIP-010 trait
        token-principal (try! (contract-call? token-principal transfer (get amount tx) (as-contract tx-sender) (get to tx) (get memo tx)))
        ;; STX transfer
        (try! (as-contract (stx-transfer? (get amount tx) tx-sender (get to tx)))))

      (emit-transaction-executed tx-id tx-sender)
      (ok true))))

;; Execute STX transaction specifically
(define-public (execute-stx-transaction (tx-id uint))
  (let ((tx (unwrap! (map-get? transactions tx-id) ERR-TRANSACTION-NOT-FOUND)))
    (begin
      (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
      (asserts! (not (get executed tx)) ERR-TRANSACTION-ALREADY-EXECUTED)
      (asserts! (>= (get approval-count tx) (var-get threshold)) ERR-INSUFFICIENT-APPROVALS)
      (asserts! (is-none (get token-contract tx)) ERR-INVALID-AMOUNT) ;; Must be STX transaction

      ;; Mark as executed
      (map-set transactions tx-id (merge tx {executed: true}))

      ;; Execute STX transfer
      (try! (as-contract (stx-transfer? (get amount tx) tx-sender (get to tx))))

      (emit-transaction-executed tx-id tx-sender)
      (ok true))))

;; Execute token transaction specifically
(define-public (execute-token-transaction (tx-id uint) (token-contract <sip-010-trait>))
  (let ((tx (unwrap! (map-get? transactions tx-id) ERR-TRANSACTION-NOT-FOUND)))
    (begin
      (asserts! (is-signer tx-sender) ERR-NOT-AUTHORIZED)
      (asserts! (not (get executed tx)) ERR-TRANSACTION-ALREADY-EXECUTED)
      (asserts! (>= (get approval-count tx) (var-get threshold)) ERR-INSUFFICIENT-APPROVALS)
      (asserts! (is-some (get token-contract tx)) ERR-INVALID-AMOUNT) ;; Must be token transaction

      ;; Mark as executed
      (map-set transactions tx-id (merge tx {executed: true}))

      ;; Execute token transfer
      (try! (as-contract (contract-call? token-contract transfer (get amount tx) tx-sender (get to tx) (get memo tx))))

      (emit-transaction-executed tx-id tx-sender)
      (ok true))))

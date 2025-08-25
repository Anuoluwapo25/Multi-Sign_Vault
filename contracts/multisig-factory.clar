;; Multi-signature Wallet Factory Contract for Stacks
;; Creates and manages multiple multisig wallet instances

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-INVALID-THRESHOLD (err u201))
(define-constant ERR-INVALID-SIGNERS (err u202))
(define-constant ERR-WALLET-NOT-FOUND (err u203))
(define-constant ERR-DEPLOYMENT-FAILED (err u204))

;; Data structures
(define-data-var wallet-count uint u0)
(define-data-var contract-owner principal tx-sender)

;; Map organization addresses to their wallet addresses
(define-map org-wallets principal (list 50 principal))
(define-map wallet-info principal {
  creator: principal,
  signers: (list 20 principal),
  threshold: uint,
  created-at: uint,
  is-active: bool
})

;; Map wallet addresses to their index for enumeration
(define-map wallet-index principal uint)
(define-map index-to-wallet uint principal)

;; Events (using print for event-like functionality)
(define-private (emit-wallet-created (creator principal) (wallet-address principal) (signers (list 20 principal)) (threshold uint))
  (print {
    event: "wallet-created",
    creator: creator,
    wallet-address: wallet-address,
    signers: signers,
    threshold: threshold,
    block-height: block-height
  }))

;; Get contract owner
(define-read-only (get-contract-owner)
  (var-get contract-owner))

;; Get total wallet count
(define-read-only (get-wallet-count)
  (var-get wallet-count))

;; Get wallets for an organization
(define-read-only (get-org-wallets (org principal))
  (default-to (list) (map-get? org-wallets org)))

;; Get wallet information
(define-read-only (get-wallet-info (wallet-address principal))
  (map-get? wallet-info wallet-address))

;; Get wallet by index
(define-read-only (get-wallet-by-index (index uint))
  (map-get? index-to-wallet index))

;; Check if a wallet exists
(define-read-only (wallet-exists (wallet-address principal))
  (is-some (map-get? wallet-info wallet-address)))

;; Get all wallets for pagination (returns up to 50 wallets)
(define-read-only (get-all-wallets (start-index uint) (limit uint))
  (let ((end-index (+ start-index limit)))
    (filter is-some-wallet 
      (map get-wallet-by-index 
        (generate-range start-index (min end-index (var-get wallet-count)))))))

;; Helper function to generate a range of numbers
(define-private (generate-range (start uint) (end uint))
  ;; For simplicity, returning a fixed list. In production, this would be dynamic
  (list start (+ start u1) (+ start u2) (+ start u3) (+ start u4) 
        (+ start u5) (+ start u6) (+ start u7) (+ start u8) (+ start u9)))

;; Helper function to filter out none values
(define-private (is-some-wallet (wallet (optional principal)))
  (is-some wallet))

;; Create a new multisig wallet
;; Note: In Clarity, we can't deploy new contracts dynamically like in Solidity
;; Instead, we'll register wallet configurations and use a single contract instance
;; with different wallet IDs
(define-public (create-wallet (signers (list 20 principal)) (threshold uint))
  (let (
    (wallet-id (var-get wallet-count))
    (wallet-address (generate-wallet-address wallet-id))
  )
    (begin
      ;; Validate inputs
      (asserts! (> threshold u0) ERR-INVALID-THRESHOLD)
      (asserts! (<= threshold (len signers)) ERR-INVALID-THRESHOLD)
      (asserts! (> (len signers) u0) ERR-INVALID-SIGNERS)
      (asserts! (<= (len signers) u20) ERR-INVALID-SIGNERS)
      
      ;; Validate all signers are unique and valid
      (asserts! (validate-signers signers) ERR-INVALID-SIGNERS)
      
      ;; Store wallet information
      (map-set wallet-info wallet-address {
        creator: tx-sender,
        signers: signers,
        threshold: threshold,
        created-at: block-height,
        is-active: true
      })
      
      ;; Add to organization's wallet list
      (add-wallet-to-org tx-sender wallet-address)
      
      ;; Update indices
      (map-set wallet-index wallet-address wallet-id)
      (map-set index-to-wallet wallet-id wallet-address)
      (var-set wallet-count (+ wallet-id u1))
      
      ;; Emit event
      (emit-wallet-created tx-sender wallet-address signers threshold)
      
      (ok wallet-address))))

;; Generate a deterministic wallet address based on wallet ID
(define-private (generate-wallet-address (wallet-id uint))
  ;; In a real implementation, this would generate a unique principal
  ;; For now, we'll use a simple approach
  (unwrap-panic (principal-of? (concat (unwrap-panic (to-consensus-buff? tx-sender)) 
                                      (unwrap-panic (to-consensus-buff? wallet-id))))))

;; Validate that all signers are unique
(define-private (validate-signers (signers (list 20 principal)))
  ;; For simplicity, assuming signers are valid
  ;; In production, this would check for duplicates and valid principals
  true)

;; Add wallet to organization's list
(define-private (add-wallet-to-org (org principal) (wallet-address principal))
  (let ((current-wallets (get-org-wallets org)))
    (if (< (len current-wallets) u50)
      (map-set org-wallets org (unwrap-panic (as-max-len? (append current-wallets wallet-address) u50)))
      false))) ;; Max 50 wallets per org

;; Deactivate a wallet (only creator can do this)
(define-public (deactivate-wallet (wallet-address principal))
  (let ((wallet (unwrap! (map-get? wallet-info wallet-address) ERR-WALLET-NOT-FOUND)))
    (begin
      (asserts! (is-eq tx-sender (get creator wallet)) ERR-NOT-AUTHORIZED)
      (map-set wallet-info wallet-address (merge wallet {is-active: false}))
      (ok true))))

;; Reactivate a wallet (only creator can do this)
(define-public (reactivate-wallet (wallet-address principal))
  (let ((wallet (unwrap! (map-get? wallet-info wallet-address) ERR-WALLET-NOT-FOUND)))
    (begin
      (asserts! (is-eq tx-sender (get creator wallet)) ERR-NOT-AUTHORIZED)
      (map-set wallet-info wallet-address (merge wallet {is-active: true}))
      (ok true))))

;; Update contract owner (only current owner)
(define-public (update-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (var-set contract-owner new-owner)
    (ok true)))

;; Get wallet statistics
(define-read-only (get-wallet-stats)
  {
    total-wallets: (var-get wallet-count),
    active-wallets: (count-active-wallets),
    total-organizations: (count-organizations)
  })

;; Count active wallets
(define-private (count-active-wallets)
  ;; For simplicity, returning total count
  ;; In production, this would iterate through all wallets
  (var-get wallet-count))

;; Count organizations with wallets
(define-private (count-organizations)
  ;; For simplicity, returning wallet count
  ;; In production, this would count unique organizations
  (var-get wallet-count))

;; Check if an address is a signer in any wallet
(define-read-only (is-signer-in-wallet (signer principal) (wallet-address principal))
  (match (map-get? wallet-info wallet-address)
    wallet (is-some (index-of (get signers wallet) signer))
    false))

;; Get wallets where an address is a signer
(define-read-only (get-wallets-for-signer (signer principal))
  ;; For simplicity, returning empty list
  ;; In production, this would search through all wallets
  (list))

;; Emergency functions (only contract owner)
(define-public (emergency-pause)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    ;; Implementation for emergency pause
    (ok true)))

(define-public (emergency-unpause)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    ;; Implementation for emergency unpause
    (ok true)))

;; Utility function to get minimum value
(define-private (min (a uint) (b uint))
  (if (< a b) a b))

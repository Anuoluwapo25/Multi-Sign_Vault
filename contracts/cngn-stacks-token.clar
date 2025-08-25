;; cNGN Token Implementation for Stacks
;; Central Bank Digital Currency - Nigerian Naira on Stacks blockchain

(impl-trait .sip-010-trait.sip-010-trait)

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant ERR-PAUSED (err u104))
(define-constant ERR-BLACKLISTED (err u105))
(define-constant ERR-NOT-AUTHORIZED (err u106))

;; Token definition
(define-fungible-token cngn-token)

;; Token metadata
(define-data-var token-name (string-ascii 32) "Central Bank Digital Currency")
(define-data-var token-symbol (string-ascii 32) "cNGN")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://cngn.co/metadata.json"))

;; Contract state
(define-data-var contract-paused bool false)
(define-data-var minter principal CONTRACT-OWNER)

;; Access control
(define-map authorized-minters principal bool)
(define-map blacklisted-addresses principal bool)

;; Events (using print for event-like functionality)
(define-private (emit-transfer (amount uint) (from principal) (to principal))
  (print {event: "transfer", amount: amount, from: from, to: to}))

(define-private (emit-mint (amount uint) (to principal))
  (print {event: "mint", amount: amount, to: to}))

(define-private (emit-burn (amount uint) (from principal))
  (print {event: "burn", amount: amount, from: from}))

;; SIP-010 Standard Functions

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-PAUSED)
    (asserts! (not (is-blacklisted from)) ERR-BLACKLISTED)
    (asserts! (not (is-blacklisted to)) ERR-BLACKLISTED)
    (asserts! (or (is-eq from tx-sender) (is-eq from contract-caller)) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    (match (ft-transfer? cngn-token amount from to)
      success (begin
        (emit-transfer amount from to)
        (ok success))
      error (err error))
  )
)

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance cngn-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply cngn-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Administrative functions

(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-PAUSED)
    (asserts! (not (is-blacklisted to)) ERR-BLACKLISTED)
    (asserts! (or (is-eq tx-sender CONTRACT-OWNER) (is-authorized-minter tx-sender)) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    (match (ft-mint? cngn-token amount to)
      success (begin
        (emit-mint amount to)
        (ok success))
      error (err error))
  )
)

(define-public (burn (amount uint) (from principal))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-PAUSED)
    (asserts! (or (is-eq from tx-sender) (is-eq tx-sender CONTRACT-OWNER)) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    (match (ft-burn? cngn-token amount from)
      success (begin
        (emit-burn amount from)
        (ok success))
      error (err error))
  )
)

;; Access control functions

(define-public (add-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (map-set authorized-minters minter true)
    (ok true)
  )
)

(define-public (remove-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (map-delete authorized-minters minter)
    (ok true)
  )
)

(define-read-only (is-authorized-minter (minter principal))
  (default-to false (map-get? authorized-minters minter))
)

;; Blacklist functions

(define-public (blacklist-address (address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (map-set blacklisted-addresses address true)
    (ok true)
  )
)

(define-public (unblacklist-address (address principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (map-delete blacklisted-addresses address)
    (ok true)
  )
)

(define-read-only (is-blacklisted (address principal))
  (default-to false (map-get? blacklisted-addresses address))
)

;; Pause functions

(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (var-set contract-paused false)
    (ok true)
  )
)

(define-read-only (is-paused)
  (var-get contract-paused)
)

;; Metadata functions

(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (var-set token-uri new-uri)
    (ok true)
  )
)

;; Bridge functions (for integration with other chains)

(define-public (bridge-mint (amount uint) (to principal) (bridge-data (buff 256)))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-PAUSED)
    (asserts! (not (is-blacklisted to)) ERR-BLACKLISTED)
    (asserts! (or (is-eq tx-sender CONTRACT-OWNER) (is-authorized-minter tx-sender)) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Mint tokens for bridge operation
    (match (ft-mint? cngn-token amount to)
      success (begin
        (emit-mint amount to)
        (print {event: "bridge-mint", amount: amount, to: to, bridge-data: bridge-data})
        (ok success))
      error (err error))
  )
)

(define-public (bridge-burn (amount uint) (from principal) (bridge-data (buff 256)))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-PAUSED)
    (asserts! (or (is-eq from tx-sender) (is-eq tx-sender CONTRACT-OWNER)) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Burn tokens for bridge operation
    (match (ft-burn? cngn-token amount from)
      success (begin
        (emit-burn amount from)
        (print {event: "bridge-burn", amount: amount, from: from, bridge-data: bridge-data})
        (ok success))
      error (err error))
  )
)

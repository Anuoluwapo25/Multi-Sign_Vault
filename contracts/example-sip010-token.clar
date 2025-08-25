;; Example SIP-010 Token Implementation
;; This is an example of how cNGN or other tokens would be implemented on Stacks

(impl-trait .sip-010-trait.sip-010-trait)

;; Token constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))

;; Token metadata
(define-fungible-token example-token)
(define-data-var token-name (string-ascii 32) "Example Token")
(define-data-var token-symbol (string-ascii 32) "EXAMPLE")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) none)

;; SIP-010 Standard Functions

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq from tx-sender) (is-eq from contract-caller)) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-transfer? example-token amount from to)
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
  (ok (ft-get-balance example-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply example-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Additional functions for token management

(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-mint? example-token amount to)
  )
)

(define-public (burn (amount uint) (from principal))
  (begin
    (asserts! (or (is-eq from tx-sender) (is-eq tx-sender CONTRACT-OWNER)) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-burn? example-token amount from)
  )
)

(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (var-set token-uri new-uri)
    (ok true)
  )
)

;; Initialize token with initial supply
(define-public (initialize (initial-supply uint) (name (string-ascii 32)) (symbol (string-ascii 32)) (decimals uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (var-set token-name name)
    (var-set token-symbol symbol)
    (var-set token-decimals decimals)
    (if (> initial-supply u0)
      (ft-mint? example-token initial-supply tx-sender)
      (ok true)
    )
  )
)

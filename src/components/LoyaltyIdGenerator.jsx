import { useState } from 'preact/hooks';

function createLoyaltyId() {
  const prefix = Math.floor(Math.random() * 1000);
  // Kept as a string: these 16-digit values can exceed Number.MAX_SAFE_INTEGER and would be rounded.
  return `${prefix}${Date.now()}`;
}

function formatToday() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export default function LoyaltyIdGenerator() {
  const [result, setResult] = useState(null);

  return (
    <div class="form">
      <button
        class="btn btn-primary"
        type="button"
        onClick={() => setResult({ today: formatToday(), id: createLoyaltyId() })}
      >
        Generate
      </button>
      {result && (
        <p class="form-message success" role="status">
          Today is: {result.today}
          <br />
          Loyalty ID: {result.id}
        </p>
      )}
    </div>
  );
}

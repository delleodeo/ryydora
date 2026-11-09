export function roadsideSignalMapLabel(signal) {
  const commuter = signal?.commuter?.displayName?.trim() || 'Commuter';
  const destination = signal?.destinationNote?.trim() || 'Destination not provided';
  return `${commuter}: ${destination}`;
}

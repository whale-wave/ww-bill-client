export function loadMotionFeatures() {
  return import('./motion-features')
    .then(module => module.default);
}

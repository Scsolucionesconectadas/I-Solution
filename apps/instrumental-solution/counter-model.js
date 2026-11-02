export function counterValue(target,progress) {
  if(!Number.isFinite(target)||target<0||!Number.isFinite(progress)) return 0;
  const fraction=Math.min(1,Math.max(0,progress));
  return fraction===1?Math.floor(target):Math.floor(target*(1-(1-fraction)**3));
}

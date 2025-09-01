// --- 1. DEFINE THE UPDATE LOGIC ---
// This function finds and replaces the text in labels.
// It can check an element to see if it's a label, or search for labels within an element.

const optionalTextHtml = '<span> (optional)</span>';
const requiredTextHtml = '<span> *</span>';

function updateMatchingLabels(element) {
  // First, check if the element itself is a label that needs updating.
  // This handles cases where a single <label> is added.
  if (element.matches && element.matches('label') && element.innerHTML.includes(optionalTextHtml)) {
    element.innerHTML = element.innerHTML.replace(optionalTextHtml, requiredTextHtml);
  }

  // Second, find any <label> elements *within* the added element.
  // This handles cases where a <div> or other container with labels inside is added.
  const nestedLabels = element.querySelectorAll('label');
  nestedLabels.forEach(label => {
    if (label.innerHTML.includes(optionalTextHtml)) {
      label.innerHTML = label.innerHTML.replace(optionalTextHtml, requiredTextHtml);
    }
  });
}


// --- 2. RUN ON INITIAL PAGE LOAD ---
// Find all existing labels and update them right away.
document.querySelectorAll('label').forEach(label => updateMatchingLabels(label));
console.log('Initial labels updated.');


// --- 3. SET UP THE DYNAMIC OBSERVER ---
// Create an observer to watch for future changes to the page.
const asterisk_observer = new MutationObserver((mutationsList) => {
  // A mutation is a change to the page's content (DOM).
  for (const mutation of mutationsList) {
    // We only care about mutations where new elements ('nodes') were added.
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        // We only work with actual HTML elements, not text or other node types.
        if (node.nodeType === Node.ELEMENT_NODE) {
          updateMatchingLabels(node);
        }
      });
    }
  }
});


// --- 4. START THE OBSERVER ---
// Tell the observer to watch the entire <body> of the page for
// additions of new child elements and to watch all descendants (subtree).
asterisk_observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Observer is now watching for dynamically added labels.');
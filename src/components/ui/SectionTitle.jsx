import React from 'react';

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6 border-b border-secondary/20 pb-4">
    <h3 className="text-xl font-bold text-secondary-dark tracking-tight">{title}</h3>
    <p className="mt-1 text-sm text-secondary">{subtitle}</p>
  </div>
);

export default SectionTitle;
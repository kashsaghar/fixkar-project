import React from 'react';

function Filters() {
  // This could be fetched from an API in a real application
  const providers = [
    { id: 1, name: 'Ali Khan', service: 'Plumber', rating: 4.5 },
    { id: 2, name: 'Sara Ahmed', service: 'Electrician', rating: 4.7 },
    { id: 3, name: 'Zain Malik', service: 'Cleaner', rating: 4.3 }
  ];
  
  return (
    <section className="filters">
      <h2>Filters</h2>
      {providers.map(provider => (
        <div className="provider" key={provider.id}>
          <h3>{provider.name}</h3>
          <p>{provider.service} | {provider.rating}★</p>
        </div>
      ))}
    </section>
  );
}

export default Filters;
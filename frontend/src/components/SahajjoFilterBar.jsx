const SahajjoFilterBar = ({ activeFilter, onFilterChange, sortBy, onSortChange }) => {
  const filters = [
    { id: 'all', icon: '🔍', bn: 'সব', en: 'All' },
    { id: 'medical', icon: '🏥', bn: 'চিকিৎসা', en: 'Medical' },
    { id: 'flood', icon: '🌊', bn: 'বন্যা', en: 'Flood' },
    { id: 'fire', icon: '🔥', bn: 'আগুন', en: 'Fire' },
    { id: 'lost_person', icon: '👤', bn: 'হারানো', en: 'Lost' },
    { id: 'food', icon: '🍚', bn: 'খাবার', en: 'Food' },
    { id: 'shelter', icon: '🏠', bn: 'আশ্রয়', en: 'Shelter' },
  ];

  return (
    <div className="filter-sort-row">
      <div className="filter-chips">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`chip-filter ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <span className="chip-icon">{filter.icon}</span>
            {filter.bn}
            <span className="chip-filter-en">/ {filter.en}</span>
          </button>
        ))}
      </div>
      <select
        className="sort-select"
        aria-label="Sort requests"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="urgency">সবচেয়ে জরুরি / Most Urgent</option>
        <option value="newest">নতুন / Newest</option>
      </select>
    </div>
  );
};

export default SahajjoFilterBar;

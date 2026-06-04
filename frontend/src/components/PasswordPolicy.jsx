const PasswordPolicy = ({ password = '' }) => {
  const rules = [
    { label: 'At least 8 characters',  test: (p) => p.length >= 8 },
    { label: 'One uppercase letter',   test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter',   test: (p) => /[a-z]/.test(p) },
    { label: 'One number',             test: (p) => /\d/.test(p) },
    { label: 'One special character',  test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  // Only show the dropdown box if the user has started typing
  const isTyping = password.length > 0;
  // Check if every single rule is currently met
  const allPassed = rules.every(r => r.test(password));

  return (
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isTyping ? 'max-h-[250px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
      }`}
    >
      <div className={`p-3.5 border rounded-xl shadow-sm transition-colors duration-300 ${
        allPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
      }`}>
        
        <p className={`text-[12.5px] font-bold tracking-wide mb-2.5 transition-colors duration-300 ${
          allPassed ? 'text-emerald-700' : 'text-indigo-900'
        }`}>
          {allPassed ? '✓ Strong password ready!' : 'Password requirements:'}
        </p>

        <div className="flex flex-col gap-2.5">
          {rules.map((rule, idx) => {
            const isValid = rule.test(password);
            return (
              <div key={idx} className="flex items-center gap-3">
                
                {/* The animated checkbox icon */}
                <div
                  className={`flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300 ${
                    isValid ? 'bg-emerald-500 scale-110' : 'bg-gray-200 scale-100'
                  }`}
                >
                  {isValid ? (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 16 16">
                      <path d="M4 8l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  )}
                </div>

                {/* The text with a strikethrough effect when completed */}
                <span
                  className={`text-[13px] font-medium transition-all duration-300 ${
                    isValid 
                      ? 'text-gray-400 line-through decoration-emerald-500/40' 
                      : 'text-gray-600'
                  }`}
                >
                  {rule.label}
                </span>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PasswordPolicy;
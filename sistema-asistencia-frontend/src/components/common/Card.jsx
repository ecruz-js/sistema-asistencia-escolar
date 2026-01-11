const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = "",
  padding = true,
  ...props
}) => {
  return (
    <div className={`card ${!padding ? "p-0" : ""} ${className}`} {...props}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

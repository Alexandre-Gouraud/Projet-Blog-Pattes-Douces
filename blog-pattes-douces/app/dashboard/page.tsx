import React from "react";

const Dashboard = () => {
  return (
    <>
    <div className="flex flex-wrap gap-6">
      <div className="stats intersect:motion-preset-slide-left intersect:motion-ease-spring-bouncier max-sm:w-full">
        <div className="stat">
          <div className="avatar avatar-placeholder">
            <div className="bg-success/20 text-success size-10 rounded-full">
              <span className="icon-[tabler--package] size-6"></span>
            </div>
          </div>
          <div className="stat-value mb-1">Order</div>
          <div className="stat-title">7,500 of 10,000 orders</div>
          <div className="progress bg-success/10 h-2" role="progressbar" aria-label="Order Progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar progress-success w-3/4"></div>
          </div>
        </div>
      </div>

      <div className="stats intersect:motion-preset-slide-left intersect:motion-delay-[400ms] intersect:motion-ease-spring-bouncier max-sm:w-full">
        <div className="stat">
          <div className="avatar avatar-placeholder">
            <div className="bg-warning/20 text-warning size-10 rounded-full">
              <span className="icon-[tabler--cash] size-6"></span>
            </div>
          </div>
          <div className="stat-value mb-1">Revenue</div>
          <div className="stat-title">$45,000 of $100,000</div>
          <div className="progress bg-warning/10 h-2" role="progressbar" aria-label="Revenue Progressbar" aria-valuenow={45} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar progress-warning w-2/5"></div>
          </div>
        </div>
      </div>

      <div className="stats intersect:motion-preset-slide-left intersect:motion-delay-[800ms] intersect:motion-ease-spring-bouncier max-sm:w-full">
        <div className="stat">
          <div className="avatar avatar-placeholder">
            <div className="bg-error/20 text-error size-10 rounded-full">
              <span className="icon-[tabler--credit-card] size-6"></span>
            </div>
          </div>
          <div className="stat-value mb-1">Invoice</div>
          <div className="stat-title">$18,200 of $25,000</div>
          <div className="progress bg-error/10 h-2" role="progressbar" aria-label="Invoice Progressbar" aria-valuenow={73} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar progress-error w-[73%]"></div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h2 className="intersect:motion-preset-blur-left intersect:motion-delay-[1000ms] mb-4 text-3xl font-bold">
        Track Your Stats
      </h2>
      <p className="intersect:motion-preset-focus intersect:motion-delay-[1400ms]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
    </>
  );
};

export default Dashboard;

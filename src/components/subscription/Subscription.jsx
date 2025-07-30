
import React from "react";
import "./Subscription.css";

const Subscription = () => {
  return (
    <section className="plans__container">
      <div className="plans">
        <div className="plansHero">
          <h1 className="plansHero__title">Simple, transparent pricing</h1>
          <p className="plansHero__subtitle">No contracts. No surprise fees.</p>
        </div>
        <div className="planItem__container">
          {/* Free Plan */}
          <div className="planItem planItem--free">
            <div className="card">
              <div className="card__header">
                <div className="card__icon symbol symbol--rounded"></div>
                <h2>Free</h2>
              </div>
              <div className="card__desc">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
            </div>
            <div className="price">$0<span>/ month</span></div>
            <ul className="featureList">
              <li>2 links</li>
              <li>Own analytics platform</li>
              <li className="disabled">Chat support</li>
              <li className="disabled">Mobile application</li>
              <li className="disabled">Unlimited users</li>
            </ul>
            <button className="button">Get Started</button>
          </div>

          {/* Pro Plan */}
          <div className="planItem planItem--pro">
            <div className="card">
              <div className="card__header">
                <div className="card__icon symbol"></div>
                <h2>Pro</h2>
                <div className="card__label label">Best Value</div>
              </div>
              <div className="card__desc">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</div>
            </div>
            <div className="price">$18<span>/ month</span></div>
            <ul className="featureList">
              <li>10 links</li>
              <li>Own analytics platform</li>
              <li>Chat support</li>
              <li className="disabled">Mobile application</li>
              <li className="disabled">Unlimited users</li>
            </ul>
            <button className="button button--pink">Get Started</button>
          </div>

          {/* Enterprise Plan */}
          <div className="planItem planItem--entp">
            <div className="card">
              <div className="card__header">
                <div className="card__icon"></div>
                <h2>Enterprise</h2>
              </div>
              <div className="card__desc">Custom solutions for larger teams and organizations.</div>
            </div>
            <div className="price">Let's Talk</div>
            <ul className="featureList">
              <li>Unlimited links</li>
              <li>Own analytics platform</li>
              <li>Chat support</li>
              <li>Mobile application</li>
              <li>Unlimited users</li>
              <li>Customizable Panel</li>
            </ul>
            <button className="button button--white">Get Started</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscription;

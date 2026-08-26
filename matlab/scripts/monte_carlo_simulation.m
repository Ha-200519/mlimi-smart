% MATLAB Function: monte_carlo_simulation.m
% Monte Carlo 10,000 Iteration Risk Simulation for Malawian Smallholders
function [meanProfit, stdProfit, probLoss, VaR95, profits] = monte_carlo_simulation(baseYield, basePrice, baseCost, N)
    if nargin < 1, baseYield = 2500; end
    if nargin < 2, basePrice = 650; end
    if nargin < 3, baseCost = 300000; end
    if nargin < 4, N = 10000; end

    yieldStd = baseYield * 0.18;
    priceStd = basePrice * 0.14;
    costStd = baseCost * 0.08;

    simYield = normrnd(baseYield, yieldStd, [N, 1]);
    simPrice = normrnd(basePrice, priceStd, [N, 1]);
    simCost = normrnd(baseCost, costStd, [N, 1]);

    profits = (simYield .* simPrice) - simCost;

    meanProfit = mean(profits);
    stdProfit = std(profits);

    losses = profits(profits < 0);
    probLoss = (length(losses) / N) * 100;

    sortedProfits = sort(profits);
    varIndex = floor(N * 0.05);
    VaR95 = abs(sortedProfits(varIndex));
end

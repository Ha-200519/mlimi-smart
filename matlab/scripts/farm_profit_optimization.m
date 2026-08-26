% MATLAB Function: farm_profit_optimization.m
% Linear Programming Farm Land and Resource Allocation Optimizer
function [x, maxProfit, exitflag] = farm_profit_optimization(landA, budgetB, waterW)
    if nargin < 1, landA = 3.0; end
    if nargin < 2, budgetB = 1200000; end
    if nargin < 3, waterW = 5000000; end

    % Objective: Maximize Profit -> Minimize -Profit
    % Crops: 1: Maize, 2: Groundnuts, 3: Beans, 4: Soybeans
    % Profit/ha (MWK): Maize=1.8M, Gnuts=1.49M, Beans=1.34M, Soybeans=1.365M
    f = [-1800000; -1490000; -1340000; -1365000];

    % Inequality Constraints A * x <= b
    A = [
        1, 1, 1, 1;                       % Land constraint
        280000, 220000, 200000, 210000;   % Budget constraint
        1200000, 900000, 800000, 1000000  % Water constraint
    ];
    b = [landA; budgetB; waterW];

    lb = zeros(4, 1); % x >= 0
    ub = [landA; landA; landA; landA];

    options = optimoptions('linprog', 'Display', 'off');
    [x, fval, exitflag] = linprog(f, A, b, [], [], lb, ub, options);

    maxProfit = -fval;
end

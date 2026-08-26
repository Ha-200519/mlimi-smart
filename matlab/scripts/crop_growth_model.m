% MATLAB Function: crop_growth_model.m
% Logistic and Environmental Crop Growth Simulation for Malawi Agriculture
function [t, B_logistic, B_env] = crop_growth_model(cropType, r, K, days, tempC, rainMm, soilIndex)
    if nargin < 1, cropType = 'maize'; end
    if nargin < 2, r = 0.085; end
    if nargin < 3, K = 12000; end
    if nargin < 4, days = 120; end
    if nargin < 5, tempC = 25; end
    if nargin < 6, rainMm = 500; end
    if nargin < 7, soilIndex = 0.8; end

    t = 1:days;
    B_logistic = zeros(1, days);
    B_env = zeros(1, days);

    B_logistic(1) = 20;
    B_env(1) = 20;

    % Environmental factor calculation
    tempFactor = exp(-((tempC - 25)/7)^2);
    waterFactor = min(1.0, rainMm / 500);
    envScalar = tempFactor * waterFactor * soilIndex;

    for d = 2:days
        dB_log = r * B_logistic(d-1) * (1 - B_logistic(d-1)/K);
        B_logistic(d) = B_logistic(d-1) + dB_log;

        dB_env = r * B_env(d-1) * (1 - B_env(d-1)/K) * envScalar;
        B_env(d) = B_env(d-1) + dB_env;
    end
end

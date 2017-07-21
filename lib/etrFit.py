import sys
import json
import pickle
from sklearn.ensemble import ExtraTreesRegressor

X = json.loads(sys.argv[1])
Y = json.loads(sys.argv[2])

n_estimators = 3000
min_samples_split = 5
min_samples_leaf = 1
n_jobs = -1

ETR = ExtraTreesRegressor(n_estimators=n_estimators, min_samples_split=min_samples_split, min_samples_leaf=min_samples_leaf, n_jobs=n_jobs)
ETR = ETR.fit(X, Y)

with open("ETR.obj", "wb") as filehandler:
    pickle.dump(ETR, filehandler)
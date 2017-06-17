import sys
import json
import pickle
from sklearn.ensemble import ExtraTreesRegressor

X = json.loads(sys.argv[1])
Y = json.loads(sys.argv[2])

ETR = ExtraTreesRegressor(n_estimators=800, min_samples_split=5, n_jobs=-1)
ETR = ETR.fit(X, Y)

with open("ETR.obj", "wb") as filehandler:
    pickle.dump(ETR, filehandler)


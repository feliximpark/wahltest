# -*- coding: utf-8 -*-
"""
Created on Fri Dec 15 17:42:52 2017

@author: Christoph Knoop
"""

import pandas as pd

#importing csv as utf-8 / deleting not used columns/rows
#IMPORTANT: decoding ut-8
df = pd.read_csv('./data/wahl_bs.csv', encoding = "utf-8")
df.drop(["TYP", "WAHLKREIS", "A1", "A2", "A3", "B1"], axis=1, inplace=True)
df.query('BEZEICHNUNG != "Briefwahl"', inplace=True)

#calculating turnout and percent of first-votes in percent
#creating new columns in dataframe
df['Beteiligung'] = round(((df['B'] / df['A']) * 100),2)
df['Müller_CDU'] = round(((df['D1']/df['D'])*100),2)
df['Reimann_SPD'] = round(((df['D2']/df['D'])*100),2)
df['Krause_Grüne'] = round(((df['D3']/df['D'])*100),2)
df['Gürtas_Linke'] = round(((df['D4']/df['D'])*100),2)
df['Schramm_FDP'] = round(((df['D5']/df['D'])*100),2)
df['Hanker_AFD'] = round(((df['D6']/df['D'])*100),2)
df['Deutsch_MLPD'] = round(((df['D11']/df['D'])*100),2)
df['Rosenbaum_BIBS'] = round(((df['D19']/df['D'])*100),2)


#calculationg second-votes in percent
#creating new columns for second vote
df['CDU'] = round(((df['F1'] / df['F'])*100),2)
df['SPD'] = round(((df['F2'] / df['F'])*100),2)
df['Grüne'] = round(((df['F3'] / df['F'])*100),2)
df['Linke'] = round(((df['F4'] / df['F'])*100),2)
df['FDP'] = round(((df['F5'] / df['F'])*100),2)
df['AFD'] = round(((df['F6'] / df['F'])*100),2)
df['Sonstige'] = 100 - df['CDU'] - df['SPD'] - df['Grüne'] - df['Linke'] - df['FDP'] - df['AFD']

#determination of winners (first- and second-votes)
df['es_gewinner'] = df.loc[:,'Müller_CDU':'Gürtas_Linke'].idxmax(axis=1)
df['zs_gewinner'] = df.loc[:,'CDU':'AFD'].idxmax(axis=1)

#creating bins for coropleth-color
#first getting percent-values from max, then filling in id-color-numbers
cdu_labels = [1,2,3]
spd_labels = [4,5,6]
gruene_labes = [7,8,9]

cdu_var = df.CDU.describe()['max']
spd_var = df.SPD.describe()['max']
gruene_var = df.Grüne.describe()['max']
bin_cdu = [cdu_var - cdu_var *0.15, cdu_var-cdu_var*0.3, cdu_var-cdu_var*0.35]
bin_spd = [spd_var - spd_var *0.15, spd_var - spd_var *0.3, spd_var - spd_var *0.35]
bin_gruene = [gruene_var - gruene_var*0.15, gruene_var - gruene_var*0.3, gruene_var - gruene_var*0.35]

#function for apply()/filling in right color-ID, creating new column for second votes
def check_results (row):
    if row['zs_gewinner'] == 'CDU':
        if row['CDU'] < bin_cdu[1]:
            return 3
        if row['CDU'] >= bin_cdu[1] and row['CDU'] < bin_cdu[0]:
            return 2
        if row['CDU'] >= bin_cdu[0]:
            return 1
    if row['zs_gewinner'] == 'SPD':
        if row['SPD'] < bin_spd[1]:
            return 6
        if row['SPD'] >= bin_spd[1] and row['SPD'] < bin_spd[0]:
            return 5
        if row['SPD'] >= bin_spd[0]:
            return 4
    if row['zs_gewinner'] == 'Grüne':
        if row['Grüne'] < bin_gruene[1]:
            return 9
        if row['Grüne'] >= bin_gruene[1] and row['Grüne'] < bin_gruene[0]:
            return 8
        if row['Grüne'] >= bin_gruene[0]:
            return 7

df['gewichtung_zs'] = df.apply(lambda row: check_results(row), axis=1)

#doing the same with first-votes
cdu_vares = df.Müller_CDU.describe()['max']
spd_vares = df.Reimann_SPD.describe()['max']
gruene_vares = df.Krause_Grüne.describe()['max']
bin_cdu_es = [cdu_vares - cdu_vares *0.15, cdu_vares-cdu_vares*0.3, cdu_vares-cdu_vares*0.35]
bin_spd_es = [spd_vares - spd_vares *0.15, spd_vares - spd_vares *0.3, spd_vares - spd_vares *0.35]
bin_gruene_es = [gruene_vares - gruene_vares*0.15, gruene_vares - gruene_vares*0.3, gruene_vares - gruene_vares*0.35]

def check_results_es (row):
    if row['es_gewinner'] == 'Müller_CDU':
        if row['Müller_CDU'] < bin_cdu_es[1]:
            return 3
        if row['Müller_CDU'] >= bin_cdu_es[1] and row['Müller_CDU'] < bin_cdu_es[0]:
            return 2
        if row['Müller_CDU'] >= bin_cdu_es[0]:
            return 1
    if row['es_gewinner'] == 'Reimann_SPD':
        if row['Reimann_SPD'] < bin_spd_es[1]:
            return 6
        if row['Reimann_SPD'] >= bin_spd_es[1] and row['Reimann_SPD'] < bin_spd_es[0]:
            return 5
        if row['Reimann_SPD'] >= bin_spd_es[0]:
            return 4
    if row['es_gewinner'] == 'Krause_Grüne':
        if row['Krause_Grüne'] < bin_gruene_es[1]:
            return 9
        if row['Krause_Grüne'] >= bin_gruene_es[1] and row['Krause_Grüne'] < bin_gruene_es[0]:
            return 8
        if row['Krause_Grüne'] >= bin_gruene_es[0]:
            return 7

df['gewichtung_es'] = df.apply(lambda row: check_results_es(row), axis=1)

# finding right ID-color for participation
beteiligung_var = df.Beteiligung.describe()['max']
bin_beteiligung = [beteiligung_var - beteiligung_var *0.15, beteiligung_var-beteiligung_var*0.3, beteiligung_var-beteiligung_var*0.35]
def check_participation (row):
    if row['Beteiligung'] < bin_beteiligung[1]:
        return 3
    if row['Beteiligung'] >= bin_beteiligung[1] and row['Beteiligung'] < bin_beteiligung[0]:
        return 2
    if row['Beteiligung'] >= bin_beteiligung[0]:
        return 1
df['gewichtung_beteiligung'] = df.apply(lambda row: check_participation(row), axis=1)

#get rid off unnecessary columns / checking datatype
df_clean = df.drop(df.loc[:, "C":"F18"], axis=1)
#print(df_clean.dtypes)

#exporting csv-file in utf-8
df_clean.to_csv('./data/wahl_clean_final.csv', encoding="utf-8")





















